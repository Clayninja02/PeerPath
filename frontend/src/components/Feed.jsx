import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Feed() {

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const [user] = useState(() => {
        try {
            const savedUser = JSON.parse(localStorage.getItem('user'));
            return savedUser || { u_name: 'Student' };
        } catch {
            return { u_name: 'Student' };
        }
    });

    const [activeTab, setActiveTab] = useState('feed');
    const [posts, setPosts] = useState([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [guideTitle, setGuideTitle] = useState('');
    const [guideDesc, setGuideDesc] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState([]);
    const [steps, setSteps] = useState([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [expandedCommentsPostId, setExpandedCommentsPostId] = useState(null);
    const [activeChatPostId, setActiveChatPostId] = useState(null);
    const [commentInputs, setCommentInputs] = useState({});
    const [chatInputs, setChatInputs] = useState({});
    const [postComments, setPostComments] = useState({});
    const [postChatMessages, setPostChatMessages] = useState({});

    const navigate = useNavigate();

    const fetchPosts = useCallback(async () => {
        setIsLoadingPosts(true);
        try {
            const data = await api.get('/posts');
            setPosts(data || []);
        } catch (_err) {
            console.error('Error fetching posts:', _err.message);
        } finally {
            setIsLoadingPosts(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchPosts();
    }, [navigate, fetchPosts]);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const addStepCard = () => {
        setSteps(prev => [...prev, {
            id: `step-${Date.now()}`,
            title: '',
            url: '',
            type: 'video',
            file: null
        }]);
    };

    const removeStepCard = (id) => {
        setSteps(prev => prev.filter(s => s.id !== id));
    };

    const updateStepField = (id, field, value) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!skills.includes(skillInput.trim())) {
                setSkills(prev => [...prev, skillInput.trim()]);
            }
            setSkillInput('');
        }
    };

    const removeSkill = (name) => {
        setSkills(prev => prev.filter(s => s !== name));
    };

    const handlePublishGuide = async () => {
        if (!guideTitle.trim() || steps.length === 0) {
            alert('Please provide a Title and add at least one Step Card.');
            return;
        }
        setIsPublishing(true);
        const payload = {
            title: guideTitle,
            description: guideDesc,
            skillName: skills[0] || 'General Engineering',
            resources: steps.map((step, idx) => ({
                title: step.title || `Step ${idx + 1}`,
                url: step.url,
                type: step.type,
                orderNumber: idx + 1
            }))
        };
        try {
            const newPost = await api.post('/posts', payload);
            setPosts(prev => [newPost, ...prev]);
            setGuideTitle('');
            setGuideDesc('');
            setSkills([]);
            setSteps([]);
            setShowCreateModal(false);
        } catch (_err) {
            alert('Failed to publish: ' + _err.message);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleLikePost = async (postId) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
        try {
            await api.post(`/posts/${postId}/like`);
        } catch (_err) {
            // optimistic update already applied
        }
    };

    const handleFollowPost = async (postId) => {
        try {
            await api.post(`/posts/${postId}/follow`);
            alert('Path bookmarked successfully!');
        } catch (_err) {
            alert('Guide bookmarked to profile!');
        }
    };

    const handleRepostMod = (parentPost) => {
        setGuideTitle(`Modded: ${parentPost.title}`);
        setGuideDesc(`Inherited from ${parentPost.authorName}.`);
        if (parentPost.skillName) setSkills([parentPost.skillName]);
        if (parentPost.resources) {
            setSteps(parentPost.resources.map((res, i) => ({
                id: `inherited-${i}-${Date.now()}`,
                title: res.title,
                url: res.url,
                type: res.type,
                file: null
            })));
        } else {
            setSteps([]);
        }
        setShowCreateModal(true);
    };

    const toggleCommentsBox = async (postId) => {
        if (expandedCommentsPostId === postId) {
            setExpandedCommentsPostId(null);
            return;
        }
        setExpandedCommentsPostId(postId);
        try {
            const data = await api.get(`/posts/${postId}/comments`);
            setPostComments(prev => ({ ...prev, [postId]: data || [] }));
        } catch (_err) {
            setPostComments(prev => ({ ...prev, [postId]: [] }));
        }
    };

    const handleSubmitComment = async (postId) => {
        const txt = commentInputs[postId];
        if (!txt || !txt.trim()) return;
        try {
            const newComment = await api.post(`/posts/${postId}/comments`, { content: txt });
            setPostComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }));
            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, replies: p.replies + 1 } : p));
        } catch (_err) {
            const fallback = { id: Date.now(), authorName: user.u_name || 'Student', content: txt, createdAt: new Date() };
            setPostComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), fallback] }));
            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        }
    };

    const toggleChatroomBox = async (postId) => {
        if (activeChatPostId === postId) {
            setActiveChatPostId(null);
            return;
        }
        setActiveChatPostId(postId);
        try {
            const data = await api.get(`/posts/${postId}/chat`);
            setPostChatMessages(prev => ({ ...prev, [postId]: data || [] }));
        } catch (_err) {
            setPostChatMessages(prev => ({ ...prev, [postId]: [] }));
        }
    };

    const handleSendChatMessage = async (postId) => {
        const msgTxt = chatInputs[postId];
        if (!msgTxt || !msgTxt.trim()) return;
        try {
            const newMsg = await api.post(`/posts/${postId}/chat`, { message: msgTxt });
            setPostChatMessages(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newMsg] }));
            setChatInputs(prev => ({ ...prev, [postId]: '' }));
        } catch (_err) {
            const mock = { id: Date.now(), senderName: user.u_name || 'Student', message: msgTxt, timestamp: new Date() };
            setPostChatMessages(prev => ({ ...prev, [postId]: [...(prev[postId] || []), mock] }));
            setChatInputs(prev => ({ ...prev, [postId]: '' }));
        }
    };

    const dm = darkMode;

    return (
        <div className={`min-h-screen flex transition-colors duration-500 ${dm ? 'bg-[#0b1121] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>

            {/* SIDEBAR */}
            <aside className={`w-72 fixed h-full border-r flex flex-col z-20 transition-colors duration-500 ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className={`h-20 flex items-center gap-3 px-6 border-b ${dm ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-lg shadow-md ${dm ? 'bg-white text-[#0f1d3d]' : 'bg-[#0f1d3d] text-white'}`}>
                        P²
                    </div>
                    <span className={`text-2xl font-bold tracking-tight ${dm ? 'text-white' : 'text-[#0f1d3d]'}`}>PeerPath</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {[
                        { id: 'feed', icon: '📡', label: 'Live Feed' },
                        { id: 'roadmaps', icon: '📐', label: 'Peer Roadmaps' },
                        { id: 'groups', icon: '👥', label: 'Study Groups' },
                        { id: 'saved', icon: '💾', label: 'Saved Materials' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                activeTab === tab.id
                                    ? dm ? 'bg-indigo-600 text-white shadow-md' : 'bg-[#0f1d3d] text-white shadow-md'
                                    : dm ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-[#0f1d3d]'
                            }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* MAIN */}
            <main className="flex-1 ml-72 flex flex-col h-screen overflow-hidden">

                {/* HEADER */}
                <header className={`h-20 flex items-center justify-between px-8 border-b z-10 transition-colors duration-500 ${dm ? 'bg-slate-900/80 border-slate-800 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md'}`}>
                    <div>
                        <h1 className={`text-xl font-bold capitalize ${dm ? 'text-white' : 'text-slate-800'}`}>
                            {activeTab.replace('-', ' ')}
                        </h1>
                        <p className={`text-sm font-medium ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                            Welcome, {user.u_name || 'Student'}
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div
                            onClick={toggleTheme}
                            className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 relative shadow-inner ${dm ? 'bg-indigo-600' : 'bg-slate-200'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] select-none transition-transform duration-300 ease-out ${dm ? 'translate-x-7' : 'translate-x-0'}`}>
                                {dm ? '🌙' : '☀️'}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pl-6 border-l border-slate-300/30">
                            <button
                                onClick={() => navigate('/profile')}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner cursor-pointer hover:scale-105 transition-all duration-300 ${dm ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}
                            >
                                {user.u_name ? user.u_name.charAt(0).toUpperCase() : 'S'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className={`text-sm font-bold transition-colors ${dm ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-500'}`}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* FEED CONTENT */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">

                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold">Active Engineering Nodes</h2>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className={`px-5 py-3 rounded-xl font-bold text-white shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform ${dm ? 'bg-indigo-600' : 'bg-[#0f1d3d]'}`}
                            >
                                ➕ Create a New Guide
                            </button>
                        </div>

                        {isLoadingPosts ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500 animate-pulse">Synchronizing network feed modules...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500">No blueprints shared yet. Be the first to create one!</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <div
                                    key={post.id}
                                    className={`p-6 rounded-3xl border mb-6 shadow-sm flex flex-col transition-all duration-500 ${dm ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200'}`}
                                >
                                    {/* POST HEADER */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center">
                                                {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">{post.authorName || 'Unknown Peer'}</h4>
                                                <p className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just Now'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${dm ? 'bg-slate-950 border-slate-800 text-indigo-400' : 'bg-slate-100 border-slate-200 text-[#0f1d3d]'}`}>
                                            #{post.skillName || 'General'}
                                        </span>
                                    </div>

                                    {/* POST BODY */}
                                    <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                                    <p className={`text-sm leading-relaxed mb-6 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {post.description}
                                    </p>

                                    {/* RESOURCES */}
                                    {post.resources && post.resources.length > 0 && (
                                        <div className="space-y-3 mb-6 pl-4 border-l-2 border-indigo-500/30">
                                            {post.resources.map((res, index) => (
                                                <div
                                                    key={res.id || index}
                                                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${dm ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                                                >
                                                    <div>
                                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                                                            Step {res.orderNumber || index + 1} • {res.type}
                                                        </span>
                                                        <h5 className="font-bold text-sm mt-0.5">{res.title}</h5>
                                                    </div>
                                                    {res.url && (
                                                        
                                                            href={res.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-center transition-colors"
                                                        >
                                                            🔗 View Source
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* ACTION BUTTONS */}
                                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-300/10">
                                        <button
                                            onClick={() => handleLikePost(post.id)}
                                            className={`text-sm font-semibold transition-colors cursor-pointer ${dm ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'}`}
                                        >
                                            ❤️ {post.likes || 0} Likes
                                        </button>
                                        <button
                                            onClick={() => toggleCommentsBox(post.id)}
                                            className={`text-sm font-semibold transition-colors cursor-pointer ${dm ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'}`}
                                        >
                                            💬 {post.replies || 0} Replies
                                        </button>
                                        <button
                                            onClick={() => toggleChatroomBox(post.id)}
                                            className={`text-sm font-semibold transition-colors cursor-pointer ${dm ? 'text-slate-400 hover:text-teal-400' : 'text-slate-500 hover:text-teal-600'}`}
                                        >
                                            ⚡ Live Chat
                                        </button>
                                        <button
                                            onClick={() => handleFollowPost(post.id)}
                                            className={`text-sm font-semibold transition-colors cursor-pointer ${dm ? 'text-slate-400 hover:text-amber-400' : 'text-slate-500 hover:text-amber-600'}`}
                                        >
                                            ⭐ Follow Progress
                                        </button>
                                        <button
                                            onClick={() => handleRepostMod(post)}
                                            className={`text-sm font-semibold transition-colors cursor-pointer ml-auto ${dm ? 'text-indigo-400 hover:text-indigo-300' : 'text-[#0f1d3d] hover:text-[#1d356b]'}`}
                                        >
                                            🔄 Mod Blueprint
                                        </button>
                                    </div>

                                    {/* COMMENTS */}
                                    {expandedCommentsPostId === post.id && (
                                        <div className="mt-5 pt-5 border-t border-slate-300/10 space-y-4">
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={commentInputs[post.id] || ''}
                                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitComment(post.id); }}
                                                    placeholder="Write a peer response comment..."
                                                    className={`flex-1 text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ${dm ? 'bg-slate-950 text-white focus:ring-indigo-500/30' : 'bg-slate-50 focus:ring-[#0f1d3d]/20'}`}
                                                />
                                                <button
                                                    onClick={() => handleSubmitComment(post.id)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${dm ? 'bg-indigo-600' : 'bg-[#0f1d3d]'}`}
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                                {(postComments[post.id] || []).map((comm) => (
                                                    <div key={comm.id} className={`p-3 rounded-xl text-sm ${dm ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-xs text-indigo-400">{comm.authorName || 'Peer'}</span>
                                                            <span className="text-[10px] text-slate-500">
                                                                {comm.createdAt ? new Date(comm.createdAt).toLocaleDateString() : 'Now'}
                                                            </span>
                                                        </div>
                                                        <p className={dm ? 'text-slate-300' : 'text-slate-700'}>{comm.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* LIVE CHAT */}
                                    {activeChatPostId === post.id && (
                                        <div className={`mt-4 p-4 border-t border-slate-300/10 rounded-2xl flex flex-col h-64 ${dm ? 'bg-slate-950' : 'bg-slate-100'}`}>
                                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-300/10">
                                                <span className="text-xs font-bold text-teal-400">⚡ Live Workspace Room</span>
                                                <button
                                                    onClick={() => setActiveChatPostId(null)}
                                                    className="text-xs text-slate-500 hover:text-rose-400"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto space-y-2 mb-3 text-xs pr-1">
                                                {(postChatMessages[post.id] || []).length === 0 ? (
                                                    <p className="text-slate-500 italic text-center pt-8">No live pings yet. Send a message to start.</p>
                                                ) : (
                                                    (postChatMessages[post.id] || []).map(m => (
                                                        <div key={m.id} className="leading-tight">
                                                            <strong className="text-indigo-400">{m.senderName}: </strong>
                                                            <span className={dm ? 'text-slate-300' : 'text-slate-700'}>{m.message}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={chatInputs[post.id] || ''}
                                                    onChange={(e) => setChatInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(post.id); }}
                                                    placeholder="Type real-time ping..."
                                                    className={`flex-1 text-xs rounded-lg px-3 py-1.5 focus:outline-none ${dm ? 'bg-slate-900 text-white' : 'bg-white'}`}
                                                />
                                                <button
                                                    onClick={() => handleSendChatMessage(post.id)}
                                                    className="px-3 bg-teal-600 text-white rounded-lg text-xs font-bold"
                                                >
                                                    Send
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* CREATE GUIDE MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border flex flex-col max-h-[85vh] ${dm ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>

                        {/* MODAL HEADER */}
                        <div className="p-6 border-b border-slate-300/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Forge Path Blueprint</h2>
                            <button
                                onClick={() => { setShowCreateModal(false); setSteps([]); setSkills([]); }}
                                className="text-slate-400 hover:text-rose-500 font-bold text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {/* MODAL BODY */}
                        <div className="p-6 overflow-y-auto space-y-5 flex-1">

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Guide Title</label>
                                <input
                                    type="text"
                                    value={guideTitle}
                                    onChange={(e) => setGuideTitle(e.target.value)}
                                    placeholder="e.g. How to set up a MySQL database"
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${dm ? 'bg-slate-950 border-slate-800 focus:ring-indigo-500/30' : 'bg-slate-50 border-slate-200 focus:ring-[#0f1d3d]/20'}`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={guideDesc}
                                    onChange={(e) => setGuideDesc(e.target.value)}
                                    rows="3"
                                    placeholder="Describe what this guide covers..."
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${dm ? 'bg-slate-950 border-slate-800 focus:ring-indigo-500/30' : 'bg-slate-50 border-slate-200 focus:ring-[#0f1d3d]/20'}`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Associated Skill</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {skills.map(s => (
                                        <span
                                            key={s}
                                            className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold flex items-center gap-1.5"
                                        >
                                            {s}
                                            <button onClick={() => removeSkill(s)}>✕</button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={handleAddSkill}
                                    placeholder="Type a skill and press Enter..."
                                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${dm ? 'bg-slate-950 border-slate-800 focus:ring-indigo-500/30' : 'bg-slate-50 border-slate-200 focus:ring-[#0f1d3d]/20'}`}
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-300/10">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold uppercase tracking-wider">Path Resources</h4>
                                    <button
                                        type="button"
                                        onClick={addStepCard}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10"
                                    >
                                        ➕ Add Step Card
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {steps.map((step, index) => (
                                        <div
                                            key={step.id}
                                            className={`p-4 border rounded-2xl relative flex flex-col gap-3 ${dm ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}
                                        >
                                            <button
                                                onClick={() => removeStepCard(step.id)}
                                                className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 font-bold"
                                            >
                                                ✕
                                            </button>
                                            <span className="text-xs font-bold text-slate-400 uppercase">Step #{index + 1}</span>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="Resource Title"
                                                    value={step.title}
                                                    onChange={(e) => updateStepField(step.id, 'title', e.target.value)}
                                                    className={`sm:col-span-2 px-3 py-2 text-xs border rounded-lg focus:outline-none ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                                                />
                                                <select
                                                    value={step.type}
                                                    onChange={(e) => updateStepField(step.id, 'type', e.target.value)}
                                                    className={`px-3 py-2 text-xs border rounded-lg focus:outline-none font-semibold ${dm ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200'}`}
                                                >
                                                    <option value="video">📺 Video</option>
                                                    <option value="article">📄 Text</option>
                                                    <option value="pdf">📁 PDF File</option>
                                                    <option value="code">💻 Repository</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 items-center">
                                                <input
                                                    type="url"
                                                    placeholder="URL Link (https://...)"
                                                    value={step.url}
                                                    onChange={(e) => updateStepField(step.id, 'url', e.target.value)}
                                                    className={`w-full sm:flex-1 px-3 py-2 text-xs border rounded-lg focus:outline-none ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                                                />
                                                <span className="text-xs font-bold text-slate-500 uppercase">OR</span>
                                                <label className={`w-full sm:w-auto cursor-pointer px-4 py-2 border rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${dm ? 'bg-slate-800 border-slate-700 text-indigo-400' : 'bg-slate-200 border-slate-300 text-indigo-600'}`}>
                                                    📁 Attach File
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="*/*"
                                                        onChange={(e) => updateStepField(step.id, 'file', e.target.files[0])}
                                                    />
                                                </label>
                                            </div>

                                            {step.file && (
                                                <div className="px-3 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg text-xs font-bold text-teal-400 flex justify-between items-center">
                                                    <span>📎 {step.file.name}</span>
                                                    <button onClick={() => updateStepField(step.id, 'file', null)} className="hover:text-rose-400">✕</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* MODAL FOOTER */}
                        <div className="p-6 border-t border-slate-300/10 flex justify-end gap-3">
                            <button
                                onClick={() => { setShowCreateModal(false); setSteps([]); setSkills([]); }}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold border ${dm ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePublishGuide}
                                disabled={isPublishing || !guideTitle.trim() || steps.length === 0}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${dm ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-[#0f1d3d] hover:bg-[#192f61]'}`}
                            >
                                {isPublishing ? 'Transmitting...' : 'Publish Roadmap'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}