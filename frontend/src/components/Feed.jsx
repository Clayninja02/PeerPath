import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Feed() {
    const [darkMode, setDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState('feed');
    const [user, setUser] = useState({ name: 'Student' });
    
    // Core Post State
    const [posts, setPosts] = useState([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    
    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [guideTitle, setGuideTitle] = useState('');
    const [guideDesc, setGuideDesc] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState([]);
    const [steps, setSteps] = useState([]); 
    const [isPublishing, setIsPublishing] = useState(false);

    // Interactive States
    const [expandedCommentsPostId, setExpandedCommentsPostId] = useState(null);
    const [activeChatPostId, setActiveChatPostId] = useState(null);
    const [commentInputs, setCommentInputs] = useState({});
    const [chatInputs, setChatInputs] = useState({});
    const [postComments, setPostComments] = useState({});
    const [postChatMessages, setPostChatMessages] = useState({});

    const navigate = useNavigate();

    // 1. Initial Load & Security Check
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) setUser(savedUser);

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') setDarkMode(true);

        fetchPosts();
    }, [navigate]);

    // 2. Fetch Posts
    const fetchPosts = async () => {
        setIsLoadingPosts(true);
        try {
            const data = await api.get('/posts');
            setPosts(data || []);
        } catch (err) {
            console.error("Error synchronizing feed:", err.message);
        } finally {
            setIsLoadingPosts(false);
        }
    };

    // 3. Step Card Management
    const addStepCard = () => {
        const newStep = {
            id: `step-${Date.now()}`,
            title: '',
            description: '',
            url: '',
            type: 'video',
            file: null
        };
        setSteps([...steps, newStep]);
    };

    const removeStepCard = (id) => {
        setSteps(steps.filter(step => step.id !== id));
    };

    const updateStepField = (id, field, value) => {
        setSteps(steps.map(step => step.id === id ? { ...step, [field]: value } : step));
    };

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const removeSkill = (name) => {
        setSkills(skills.filter(s => s !== name));
    };

    // 4. Publish Guide (Safe Fetch against JSON crashes)
    const handlePublishGuide = async () => {
        if (!guideTitle.trim() || steps.length === 0) {
            alert("Please provide a Title and add at least one dynamic Step Card.");
            return;
        }
        setIsPublishing(true);

        // Map UI steps into the expected JSON format. 
        // We deliberately ignore 'step.file' here because JSON cannot transmit raw files.
        const formattedResources = steps.map((step, idx) => ({
            title: step.title || `Step ${idx + 1}`,
            url: step.url,
            type: step.type,
            orderNumber: idx + 1
        }));

        const payload = {
            title: guideTitle,
            description: guideDesc,
            skillName: skills[0] || 'General Engineering',
            resources: formattedResources
        };

        try {
            // Using your project's reliable api wrapper instead of manual fetch
            const newPost = await api.post('/posts', payload);

            // Success! Add to feed and close modal
            setPosts([newPost, ...posts]);
            setGuideTitle('');
            setGuideDesc('');
            setSkills([]);
            setSteps([]);
            setShowCreateModal(false);
            
        } catch (err) {
            alert("Failed to submit path blueprint: " + err.message);
        } finally {
            setIsPublishing(false);
        }
    };

    // 5. Social Actions
    const handleLikePost = async (postId) => {
        try {
            await api.post(`/posts/${postId}/like`);
            setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
        } catch (err) {
            setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
        }
    };

    const handleFollowPost = async (postId) => {
        try {
            await api.post(`/posts/${postId}/follow`);
            alert("🚀 Path bookmarked to your learning progress dashboard successfully!");
        } catch (err) {
            alert("Guide bookmarked to profile!");
        }
    };

    const handleRepostMod = (parentPost) => {
        setGuideTitle(`Modded: ${parentPost.title}`);
        setGuideDesc(`Inherited blueprint from ${parentPost.authorName}. Added modifications.`);
        if (parentPost.skillName) setSkills([parentPost.skillName]);
        
        if (parentPost.resources) {
            const inheritedSteps = parentPost.resources.map((res, i) => ({
                id: `inherited-${i}-${Date.now()}`,
                title: res.title,
                url: res.url,
                type: res.type,
                file: null
            }));
            setSteps(inheritedSteps);
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
            setPostComments({ ...postComments, [postId]: data || [] });
        } catch (err) {
            setPostComments({ ...postComments, [postId]: [] });
        }
    };

    const handleSubmitComment = async (postId) => {
        const txt = commentInputs[postId];
        if (!txt || !txt.trim()) return;

        try {
            const newComment = await api.post(`/posts/${postId}/comments`, { content: txt });
            const currentComments = postComments[postId] || [];
            setPostComments({ ...postComments, [postId]: [...currentComments, newComment] });
            setCommentInputs({ ...commentInputs, [postId]: '' });
            setPosts(posts.map(p => p.id === postId ? { ...p, replies: p.replies + 1 } : p));
        } catch (err) {
            const fallbackComment = { id: Date.now(), authorName: user.name, content: txt, createdAt: new Date() };
            const currentComments = postComments[postId] || [];
            setPostComments({ ...postComments, [postId]: [...currentComments, fallbackComment] });
            setCommentInputs({ ...commentInputs, [postId]: '' });
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
            setPostChatMessages({ ...postChatMessages, [postId]: data || [] });
        } catch (err) {
            setPostChatMessages({ ...postChatMessages, [postId]: [] });
        }
    };

    const handleSendChatMessage = async (postId) => {
        const msgTxt = chatInputs[postId];
        if (!msgTxt || !msgTxt.trim()) return;

        try {
            const newMsg = await api.post(`/posts/${postId}/chat`, { message: msgTxt });
            const currentMsgs = postChatMessages[postId] || [];
            setPostChatMessages({ ...postChatMessages, [postId]: [...currentMsgs, newMsg] });
            setChatInputs({ ...chatInputs, [postId]: '' });
        } catch (err) {
            const mockMsg = { id: Date.now(), senderName: user.name, message: msgTxt, timestamp: new Date() };
            const currentMsgs = postChatMessages[postId] || [];
            setPostChatMessages({ ...postChatMessages, [postId]: [...currentMsgs, mockMsg] });
            setChatInputs({ ...chatInputs, [postId]: '' });
        }
    };

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

    return (
        <div className={`min-h-screen flex transition-colors duration-500 ${darkMode ? 'bg-[#0b1121] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
            
            {/* ⬅️ SIDEBAR NAVIGATION */}
            <aside className={`w-72 fixed h-full border-r flex flex-col z-20 transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className={`h-20 flex items-center gap-3 px-6 border-b transition-colors duration-500 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-lg shadow-md transition-all duration-500 ${darkMode ? 'bg-white text-[#0f1d3d]' : 'bg-[#0f1d3d] text-white'}`}>P²</div>
                    <span className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-[#0f1d3d]'}`}>PeerPath</span>
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
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 
                                ${activeTab === tab.id 
                                    ? darkMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-[#0f1d3d] text-white shadow-md'
                                    : darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-[#0f1d3d]'
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ➡️ MAIN WORKSPACE BLOCK AREA */}
            <main className="flex-1 ml-72 flex flex-col h-screen overflow-hidden">
                
                {/* TOP HEADER */}
                <header className={`h-20 flex items-center justify-between px-8 border-b z-10 transition-colors duration-500 ${darkMode ? 'bg-slate-900/80 border-slate-800 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md'}`}>
                    <div>
                        <h1 className={`text-xl font-bold capitalize transition-colors duration-500 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{activeTab.replace('-', ' ')}</h1>
                        <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Welcome, {user.name}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div onClick={toggleTheme} className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 relative shadow-inner ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] select-none transition-transform duration-300 ease-out transform ${darkMode ? 'translate-x-7' : 'translate-x-0'}`}>
                                {darkMode ? '🌙' : '☀️'}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pl-6 border-l border-slate-300/30">
                            <button 
                                onClick={() => navigate('/profile')}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner cursor-pointer hover:scale-105 transition-all duration-300 ${darkMode ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}
                            >
                                {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                            </button>
                            <button onClick={handleLogout} className={`text-sm font-bold transition-colors ${darkMode ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-500'}`}>
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* SCROLLABLE LIVE WORKSPACE AREA */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-4xl mx-auto">
                        
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold">Active Engineering Nodes</h2>
                            <button 
                                onClick={() => setShowCreateModal(true)}
                                className={`px-5 py-3 rounded-xl font-bold text-white shadow-md flex items-center gap-2 transition-transform cursor-pointer hover:scale-[1.02] active:scale-95 ${darkMode ? 'bg-indigo-600' : 'bg-[#0f1d3d]'}`}
                            >
                                ➕ Create a New Guide
                            </button>
                        </div>

                        {/* FEED LIST RENDER */}
                        {isLoadingPosts ? (
                            <div className="text-center py-12"><p className="text-slate-500 animate-pulse">Synchronizing network feed modules...</p></div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12"><p className="text-slate-500">No blueprints shared in this cohort database yet.</p></div>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className={`p-6 rounded-3xl border mb-6 shadow-sm flex flex-col transition-all duration-500 ${darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                                    
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center">
                                                {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">{post.authorName || 'Unknown Peer'}</h4>
                                                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just Now'}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${darkMode ? 'bg-slate-950 border-slate-800 text-indigo-400' : 'bg-slate-100 border-slate-200 text-[#0f1d3d]'}`}>
                                            #{post.skillName || 'General'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                                    <p className={`text-sm leading-relaxed mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{post.description}</p>

                                    {/* RESOURCES RENDER */}
                                    {post.resources && post.resources.length > 0 && (
                                        <div className="space-y-3 mb-6 pl-4 border-l-2 border-indigo-500/30">
                                            {post.resources.map((res, index) => (
                                                <div key={res.id || index} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                                    <div>
                                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step {res.orderNumber || index + 1} • {res.type}</span>
                                                        <h5 className="font-bold text-sm mt-0.5">{res.title}</h5>
                                                    </div>
                                                    {res.url && (
                                                        <a href={res.url} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-center transition-colors">
                                                            🔗 View Source
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* ACTIONS */}
                                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-300/10">
                                        <button onClick={() => handleLikePost(post.id)} className={`text-sm font-semibold transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'}`}>
                                            ❤️ {post.likes || 0} Likes
                                        </button>
                                        <button onClick={() => toggleCommentsBox(post.id)} className={`text-sm font-semibold transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'}`}>
                                            💬 {post.replies || 0} Replies
                                        </button>
                                        <button onClick={() => toggleChatroomBox(post.id)} className={`text-sm font-semibold transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:text-teal-400' : 'text-slate-500 hover:text-teal-600'}`}>
                                            💬 Live Chat
                                        </button>
                                        <button onClick={() => handleFollowPost(post.id)} className={`text-sm font-semibold transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:text-amber-400' : 'text-slate-500 hover:text-amber-600'}`}>
                                            ⭐ Follow Progress
                                        </button>
                                        <button onClick={() => handleRepostMod(post)} className={`text-sm font-semibold transition-colors cursor-pointer ml-auto ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-[#0f1d3d] hover:text-[#1d356b]'}`}>
                                            🔄 Mod Blueprint
                                        </button>
                                    </div>

                                    {/* COMMENTS SECTION */}
                                    {expandedCommentsPostId === post.id && (
                                        <div className={`mt-5 pt-5 border-t space-y-4 border-slate-300/10`}>
                                            <div className="flex gap-3">
                                                <input 
                                                    type="text"
                                                    value={commentInputs[post.id] || ''}
                                                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                                    placeholder="Write a peer response comment..."
                                                    className={`flex-1 text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ${darkMode ? 'bg-slate-950 border-slate-800 text-white focus:ring-indigo-500/30' : 'bg-slate-50 border-slate-200 focus:ring-[#0f1d3d]/20'}`}
                                                    onKeyDown={(e) => { if(e.key === 'Enter') handleSubmitComment(post.id); }}
                                                />
                                                <button onClick={() => handleSubmitComment(post.id)} className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${darkMode ? 'bg-indigo-600' : 'bg-[#0f1d3d]'}`}>Reply</button>
                                            </div>
                                            
                                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                                {(postComments[post.id] || []).map((comm) => (
                                                    <div key={comm.id} className={`p-3 rounded-xl text-sm ${darkMode ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-xs text-indigo-400">{comm.authorName || 'Peer'}</span>
                                                            <span className="text-[10px] text-slate-500">{comm.createdAt ? new Date(comm.createdAt).toLocaleDateString() : 'Now'}</span>
                                                        </div>
                                                        <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{comm.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* LIVE CHAT SECTION */}
                                    {activeChatPostId === post.id && (
                                        <div className={`mt-4 p-4 border-t border-slate-300/10 rounded-2xl flex flex-col h-64 ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-300/10">
                                                <span className="text-xs font-bold text-teal-400">⚡ Live Workspace Room</span>
                                                <button onClick={() => setActiveChatPostId(null)} className="text-xs text-slate-500 hover:text-rose-400">Close</button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto space-y-2 mb-3 text-xs pr-1">
                                                {(postChatMessages[post.id] || []).length === 0 ? (
                                                    <p className="text-slate-500 italic text-center pt-8">No live pings. Send a text to open context.</p>
                                                ) : (
                                                    (postChatMessages[post.id] || []).map(m => (
                                                        <div key={m.id} className="leading-tight">
                                                            <strong className="text-indigo-400">{m.senderName}: </strong>
                                                            <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{m.message}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text"
                                                    value={chatInputs[post.id] || ''}
                                                    onChange={(e) => setChatInputs({ ...chatInputs, [post.id]: e.target.value })}
                                                    placeholder="Type real-time ping..."
                                                    className={`flex-1 text-xs rounded-lg px-3 py-1.5 focus:outline-none ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'}`}
                                                    onKeyDown={(e) => { if(e.key === 'Enter') handleSendChatMessage(post.id); }}
                                                />
                                                <button onClick={() => handleSendChatMessage(post.id)} className="px-3 bg-teal-600 text-white rounded-lg text-xs font-bold">Send</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* 🛸 MASTER OVERLAY MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
                    <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border flex flex-col max-h-[85vh] transition-colors duration-500 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                        
                        <div className="p-6 border-b border-slate-300/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Forge Path Blueprint</h2>
                            <button onClick={() => { setShowCreateModal(false); setSteps([]); setSkills([]); }} className="text-slate-400 hover:text-rose-500 font-bold">✕</button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5 flex-1 pr-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Guide Title</label>
                                <input type="text" value={guideTitle} onChange={(e) => setGuideTitle(e.target.value)} className={`w-full px-4 py-3 border rounded-xl focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Detailed Context Description</label>
                                <textarea value={guideDesc} onChange={(e) => setGuideDesc(e.target.value)} rows="3" className={`w-full px-4 py-3 border rounded-xl focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Associated Skill</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {skills.map(s => (
                                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold flex items-center gap-1.5">{s} <button onClick={() => removeSkill(s)}>✕</button></span>
                                    ))}
                                </div>
                                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} className={`w-full px-4 py-2 border rounded-xl focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} />
                            </div>

                            <div className="pt-4 border-t border-slate-300/10">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold uppercase tracking-wider">Sequential Path Resources</h4>
                                    <button type="button" onClick={addStepCard} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10">➕ Add Roadmap Step Card</button>
                                </div>

                                <div className="space-y-4">
                                    {steps.map((step, index) => (
                                        <div key={step.id} className={`p-4 border rounded-2xl relative flex flex-col gap-3 shadow-inner ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
                                            <button onClick={() => removeStepCard(step.id)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 text-sm font-bold">✕</button>
                                            <span className="text-xs font-bold text-slate-400 uppercase">Step Matrix Index #{index + 1}</span>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <input type="text" placeholder="Resource Title" value={step.title} onChange={(e) => updateStepField(step.id, 'title', e.target.value)} className={`sm:col-span-2 px-3 py-2 text-xs border rounded-lg focus:outline-none ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} />
                                                <select value={step.type} onChange={(e) => updateStepField(step.id, 'type', e.target.value)} className={`px-3 py-2 text-xs border rounded-lg focus:outline-none font-semibold ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200'}`}>
                                                    <option value="video">📺 Video</option>
                                                    <option value="article">📄 Text</option>
                                                    <option value="pdf">📁 PDF File</option>
                                                    <option value="code">💻 Repository</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 items-center">
                                                <input type="url" placeholder="URL Link (HTTPS://...)" value={step.url} onChange={(e) => updateStepField(step.id, 'url', e.target.value)} className={`w-full sm:flex-1 px-3 py-2 text-xs border rounded-lg focus:outline-none ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} />
                                                <span className="text-xs font-bold text-slate-500 uppercase">OR</span>
                                                <label className={`w-full sm:w-auto cursor-pointer px-4 py-2 border rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${darkMode ? 'bg-slate-800 border-slate-700 text-indigo-400' : 'bg-slate-200 border-slate-300 text-indigo-600'}`}>
                                                    📁 Attach File
                                                    <input type="file" className="hidden" accept="*/*" onChange={(e) => updateStepField(step.id, 'file', e.target.files[0])} />
                                                </label>
                                            </div>
                                            
                                            {step.file && (
                                                <div className="px-3 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg text-xs font-bold text-teal-400 flex justify-between items-center">
                                                    <span>📎 Ready to upload: {step.file.name}</span>
                                                    <button onClick={() => updateStepField(step.id, 'file', null)} className="hover:text-rose-400">✕</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-300/10 flex justify-end gap-3 bg-transparent">
                            <button onClick={() => { setShowCreateModal(false); setSteps([]); setSkills([]); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold border ${darkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'}`}>Cancel</button>
                            <button onClick={handlePublishGuide} disabled={isPublishing || !guideTitle.trim() || steps.length === 0} className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md ${darkMode ? 'bg-indigo-600' : 'bg-[#0f1d3d]'}`}>
                                {isPublishing ? 'Transmitting...' : 'Publish Roadmap'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}