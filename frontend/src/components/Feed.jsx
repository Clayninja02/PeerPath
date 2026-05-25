import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Feed() {
    // ==========================================
    // 1. GLOBAL STATES
    // ==========================================
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [user] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')) || { u_name: 'Student' }; }
        catch { return { u_name: 'Student' }; }
    });
    
    const [activeTab, setActiveTab] = useState('feed');
    const [posts, setPosts] = useState([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    
    // ==========================================
    // 2. MODAL & FORM STATES
    // ==========================================
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPostId, setEditingPostId] = useState(null); 
    const [guideTitle, setGuideTitle] = useState('');
    const [guideDesc, setGuideDesc] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState([]);
    const [steps, setSteps] = useState([]);
    const [isPublishing, setIsPublishing] = useState(false);
    
    // ==========================================
    // 3. INTERACTION STATES
    // ==========================================
    const [expandedCommentsPostId, setExpandedCommentsPostId] = useState(null);
    const [activeChatPostId, setActiveChatPostId] = useState(null);
    const [commentInputs, setCommentInputs] = useState({});
    const [chatInputs, setChatInputs] = useState({});
    const [postComments, setPostComments] = useState({});
    const [postChatMessages, setPostChatMessages] = useState({});
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [openMenuPostId, setOpenMenuPostId] = useState(null);

    const navigate = useNavigate();

    // ==========================================
    // 4. INITIAL DATA FETCH
    // ==========================================
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        
        let isMounted = true;
        const loadPosts = async () => {
            try {
                const data = await api.get('/posts');
                if (isMounted) setPosts(data || []);
            } catch (error) { 
                console.error('Error fetching posts:', error.message); 
            } finally { 
                if (isMounted) setIsLoadingPosts(false); 
            }
        };
        loadPosts();
        
        return () => { isMounted = false; };
    }, [navigate]);

    // ==========================================
    // 5. UTILITY HANDLERS
    // ==========================================
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

    const resetModal = () => {
        setShowCreateModal(false); 
        setEditingPostId(null);
        setGuideTitle(''); 
        setGuideDesc(''); 
        setSkills([]); 
        setSteps([]);
    };

    const addStepCard = () => setSteps(prev => [...prev, { id: `step-${Date.now()}`, title: '', url: '', type: 'video', file: null }]);
    const removeStepCard = (id) => setSteps(prev => prev.filter(s => s.id !== id));
    const updateStepField = (id, field, value) => setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!skills.includes(skillInput.trim())) setSkills(prev => [...prev, skillInput.trim()]);
            setSkillInput('');
        }
    };
    const removeSkill = (name) => setSkills(prev => prev.filter(s => s !== name));

    // ==========================================
    // 6. POST CRUD
    // ==========================================
    const handlePublishOrEditGuide = async () => {
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
            if (editingPostId) {
                const updatedPost = await api.put(`/posts/${editingPostId}`, payload);
                setPosts(prev => prev.map(p => p.id === editingPostId ? updatedPost : p));
            } else {
                const newPost = await api.post('/posts', payload);
                setPosts(prev => [newPost, ...prev]);
            }
            resetModal();
        } catch (error) { 
            alert('Failed to save: ' + error.message); 
        } finally { 
            setIsPublishing(false); 
        }
    };

    const handleEditPostInit = (post) => {
        setEditingPostId(post.id);
        setGuideTitle(post.title);
        setGuideDesc(post.description);
        if (post.skill?.sName) setSkills([post.skill.sName]);
        if (post.resources) {
            setSteps(post.resources.map((res, i) => ({
                id: `edit-${i}-${Date.now()}`, title: res.title, url: res.url, type: res.type, file: null
            })));
        } else { 
            setSteps([]); 
        }
        setShowCreateModal(true);
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to permanently delete this post?")) return;
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) { 
            alert('Failed to delete post: ' + error.message); 
        }
    };

    const handleRepostMod = (parentPost) => {
        setEditingPostId(null);
        setGuideTitle(`Modded: ${parentPost.title}`);
        setGuideDesc(`Inherited from ${parentPost.authorName}.`);
        if (parentPost.skill?.sName) setSkills([parentPost.skill.sName]);
        if (parentPost.resources) {
            setSteps(parentPost.resources.map((res, i) => ({
                id: `inherited-${i}-${Date.now()}`, title: res.title, url: res.url, type: res.type, file: null
            })));
        } else { 
            setSteps([]); 
        }
        setShowCreateModal(true);
    };

    const handleHidePost = async (postId) => {
        if (!window.confirm("Are you sure you want to hide this post?")) return;
        try {
            await api.post(`/posts/${postId}/hide`);
            // Instantly remove it from the UI. The DB filter will keep it hidden on next fetch.
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) {
            alert('Failed to hide post: ' + error.message);
        }
    };

    // ==========================================
    // 7. LIKES & FOLLOWS
    // ==========================================
    const handleLikePost = async (postId) => {
        try {
            const data = await api.post(`/posts/${postId}/like`);
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
        } catch (error) { 
            console.error('Failed to toggle like:', error.message); 
        }
    };

    const handleFollowPost = async (postId) => {
        try {
            const data = await api.post(`/posts/${postId}/follow`);
            alert(data.message);
        } catch (error) { 
            alert('Failed to modify bookmark: ' + error.message); 
        }
    };

    // ==========================================
    // 8. COMMENTS SYSTEM
    // ==========================================
const toggleCommentsBox = async (postId) => {
        if (expandedCommentsPostId === postId) { 
            setExpandedCommentsPostId(null); 
            return; 
        }
        setExpandedCommentsPostId(postId);
        try {
            const data = await api.get(`/posts/${postId}/comments`);
            setPostComments(prev => ({ ...prev, [postId]: data || [] }));
        } catch (error) { 
            console.error("Failed to load comments:", error); // <-- FIX HERE
            setPostComments(prev => ({ ...prev, [postId]: [] })); 
        }
    };

    const handleSubmitComment = async (postId) => {
        const txt = commentInputs[postId];
        if (!txt || !txt.trim()) return;
        try {
            const newComment = await api.post(`/posts/${postId}/comments`, { content: txt });
            setPostComments(prev => ({ ...prev, [postId]: [newComment, ...(prev[postId] || [])] }));
            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, replies: p.replies + 1 } : p));
        } catch (error) { 
            alert('Failed to post comment: ' + error.message); 
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await api.delete(`/posts/${postId}/comments/${commentId}`);
            setPostComments(prev => ({ ...prev, [postId]: prev[postId].filter(c => c.id !== commentId) }));
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, replies: Math.max(0, p.replies - 1) } : p));
        } catch (error) { 
            alert('Failed to delete comment: ' + error.message); 
        }
    };

    const handleSaveEditComment = async (postId, commentId) => {
        if (!editCommentText.trim()) return;
        try {
            const updatedComment = await api.put(`/posts/${postId}/comments/${commentId}`, { content: editCommentText });
            setPostComments(prev => ({
                ...prev, [postId]: prev[postId].map(c => c.id === commentId ? updatedComment : c)
            }));
            setEditingCommentId(null); 
            setEditCommentText('');
        } catch (error) { 
            alert('Failed to edit comment: ' + error.message); 
        }
    };

    // ==========================================
    // 9. LIVE CHAT SYSTEM
    // ==========================================
const toggleChatroomBox = async (postId) => {
        if (activeChatPostId === postId) { 
            setActiveChatPostId(null); 
            return; 
        }
        setActiveChatPostId(postId);
        try {
            const data = await api.get(`/posts/${postId}/chat`);
            setPostChatMessages(prev => ({ ...prev, [postId]: data || [] }));
        } catch (error) { 
            console.error("Failed to load chat messages:", error); // <-- FIX HERE
            setPostChatMessages(prev => ({ ...prev, [postId]: [] })); 
        }
    };

    const handleSendChatMessage = async (postId) => {
        const msgTxt = chatInputs[postId];
        if (!msgTxt || !msgTxt.trim()) return;
        try {
            const newMsg = await api.post(`/posts/${postId}/chat`, { message: msgTxt });
            setPostChatMessages(prev => ({ ...prev, [postId]: [newMsg, ...(prev[postId] || [])] }));
            setChatInputs(prev => ({ ...prev, [postId]: '' }));
        } catch (error) { 
            alert('Failed to send message: ' + error.message); 
        }
    };

    const dm = darkMode;

    // ==========================================
    // 10. RENDER UI
    // ==========================================
    return (
        <div className={`min-h-screen flex transition-colors duration-500 ${dm ? 'bg-[#0b1121] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
            
            {/* SIDEBAR */}
            <aside className={`w-72 fixed h-full border-r flex flex-col z-20 transition-colors duration-500 ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className={`h-20 flex items-center gap-3 px-6 border-b ${dm ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-lg shadow-md ${dm ? 'bg-white text-[#0f1d3d]' : 'bg-[#0f1d3d] text-white'}`}>P²</div>
                    <span className={`text-2xl font-bold tracking-tight ${dm ? 'text-white' : 'text-[#0f1d3d]'}`}>PeerPath</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {[
                        { id: 'feed', icon: '🏠', label: 'Home' },
                        { id: 'roadmaps', icon: '📐', label: 'Peer Roadmaps' },
                        { id: 'saved', icon: '💾', label: 'Saved Materials' },
                    ].map((tab) => (
                        <button
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                activeTab === tab.id ? dm ? 'bg-indigo-600 text-white shadow-md' : 'bg-[#0f1d3d] text-white shadow-md'
                                    : dm ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-[#0f1d3d]'
                            }`}
                        >
                            <span className="text-xl">{tab.icon}</span>{tab.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-72 flex flex-col h-screen overflow-hidden">
                
                {/* HEADER */}
                <header className={`h-20 flex items-center justify-between px-8 border-b z-10 transition-colors duration-500 ${dm ? 'bg-slate-900/80 border-slate-800 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md'}`}>
                    <div>
                        <h1 className={`text-xl font-bold capitalize ${dm ? 'text-white' : 'text-slate-800'}`}>{activeTab === 'feed' ? 'Home' : activeTab.replace('-', ' ')}</h1>
                        <p className={`text-sm font-medium ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Welcome, {user.u_name || 'Student'}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div onClick={toggleTheme} className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 relative shadow-inner ${dm ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] select-none transition-transform duration-300 ease-out ${dm ? 'translate-x-7' : 'translate-x-0'}`}>{dm ? '🌙' : '☀️'}</div>
                        </div>
                        <div className="flex items-center gap-4 pl-6 border-l border-slate-300/30">
                            <button onClick={() => navigate('/profile')} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner cursor-pointer hover:scale-105 transition-all duration-300 ${dm ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>{user.u_name ? user.u_name.charAt(0).toUpperCase() : 'S'}</button>
                            <button onClick={handleLogout} className={`text-sm font-bold transition-colors ${dm ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-500'}`}>Logout</button>
                        </div>
                    </div>
                </header>

                {/* FEED POSTS LIST */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">
                        
                        <div className="flex justify-end mb-8">
                            <button onClick={() => { setEditingPostId(null); setShowCreateModal(true); }} className={`px-5 py-3 rounded-xl font-bold text-white shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform ${dm ? 'bg-indigo-600' : 'bg-[#0f1d3d]'}`}>
                                ➕ Create a New Guide
                            </button>
                        </div>

                        {isLoadingPosts ? (
                            <div className="text-center py-12"><p className="text-slate-500 animate-pulse">Synchronizing network feed modules...</p></div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12"><p className="text-slate-500">No blueprints shared yet. Be the first to create one!</p></div>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className={`p-6 rounded-3xl border mb-6 shadow-sm flex flex-col transition-all duration-500 relative ${dm ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                                    
                                    {/* POST HEADER */}
                                    <div className="flex justify-between items-start mb-4 relative">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center">{post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}</div>
                                            <div>
                                                <h4 className="font-bold text-sm">{post.authorName || 'Unknown Peer'}</h4>
                                                <p className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just Now'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${dm ? 'bg-slate-950 border-slate-800 text-indigo-400' : 'bg-slate-100 border-slate-200 text-[#0f1d3d]'}`}>
                                                #{post.skill?.sName || 'General'}
                                            </span>
                                            
                                            {/* 3-Dot Menu Button */}
                                            <button onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)} className={`p-1.5 rounded-full transition-colors ${dm ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-[#0f1d3d]'}`}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="1"></circle>
                                                    <circle cx="12" cy="5" r="1"></circle>
                                                    <circle cx="12" cy="19" r="1"></circle>
                                                </svg>
                                            </button>

                                            {/* 3-Dot Dropdown Menu */}
                                            {openMenuPostId === post.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuPostId(null)}></div>
                                                    <div className={`absolute right-0 top-8 mt-1 w-36 rounded-xl shadow-xl border z-20 overflow-hidden py-1 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                                        {post.authorName === user.u_name && (
                                                            <>
                                                                <button onClick={() => { handleEditPostInit(post); setOpenMenuPostId(null); }} className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${dm ? 'text-slate-300 hover:bg-slate-700 hover:text-indigo-400' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}>Edit Post</button>
                                                                <button onClick={() => { handleDeletePost(post.id); setOpenMenuPostId(null); }} className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${dm ? 'text-slate-300 hover:bg-slate-700 hover:text-rose-400' : 'text-slate-700 hover:bg-rose-50 hover:text-rose-600'}`}>Delete Post</button>
                                                            </>
                                                        )}
                                                        <button onClick={() => { handleHidePost(post.id); setOpenMenuPostId(null); }} className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${dm ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}>Hide Post</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* POST BODY */}
                                    <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                                    <p className={`text-sm leading-relaxed mb-6 whitespace-pre-wrap ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{post.description}</p>

                                    {/* POST RESOURCES */}
                                    {post.resources && post.resources.length > 0 && (
                                        <div className="space-y-3 mb-6 pl-4 border-l-2 border-indigo-500/30">
                                            {post.resources.map((res, index) => (
                                                <div key={res.id || index} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${dm ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                                    <div>
                                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step {res.orderNumber || index + 1} • {res.type}</span>
                                                        <h5 className="font-bold text-sm mt-0.5">{res.title}</h5>
                                                    </div>
                                                    {res.url && <a href={res.url} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-center transition-colors">🔗 View Source</a>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* POST ACTIONS BUTTONS */}
                                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-300/10">
                                        <button onClick={() => handleLikePost(post.id)} className={`text-sm font-semibold transition-colors cursor-pointer ${dm ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'}`}>❤️ {post.likes || 0} Likes</button>
                                        <button onClick={() => toggleCommentsBox(post.id)} className={`text-sm font-semibold transition-colors cursor-pointer ${dm ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'}`}>💬 {post.replies || 0} Replies</button>
                                        <button onClick={() => toggleChatroomBox(post.id)} className={`text-sm font-semibold transition-colors cursor-pointer ${dm ? 'text-slate-400 hover:text-teal-400' : 'text-slate-500 hover:text-teal-600'}`}>⚡ Live Chat</button>
                                        <button onClick={() => handleFollowPost(post.id)} className={`text-sm font-semibold transition-colors cursor-pointer ${dm ? 'text-slate-400 hover:text-amber-400' : 'text-slate-500 hover:text-amber-600'}`}>⭐ Follow Progress</button>
                                        <button onClick={() => handleRepostMod(post)} className={`text-sm font-semibold transition-colors cursor-pointer ml-auto ${dm ? 'text-indigo-400 hover:text-indigo-300' : 'text-[#0f1d3d] hover:text-[#1d356b]'}`}>🔄 Repost</button>
                                    </div>

                                    {/* ----------------- */}
                                    {/* COMMENTS SECTION */}
                                    {/* ----------------- */}
                                    {expandedCommentsPostId === post.id && (
                                        <div className="mt-5 pt-5 border-t border-slate-300/10 flex flex-col h-72">
                                            <div className="flex gap-3 mb-4 shrink-0">
                                                <input type="text" value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitComment(post.id); }} placeholder="Write a peer response comment..." className={`flex-1 text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ${dm ? 'bg-slate-950 text-white focus:ring-indigo-500/30' : 'bg-slate-50 focus:ring-[#0f1d3d]/20'}`} />
                                                <button onClick={() => handleSubmitComment(post.id)} className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${dm ? 'bg-indigo-600' : 'bg-[#0f1d3d]'}`}>Reply</button>
                                            </div>
                                            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                                                {(postComments[post.id] || []).length === 0 ? (
                                                    <p className="text-slate-500 italic text-xs text-center">No comments yet. Be the first to reply!</p>
                                                ) : (
                                                    (postComments[post.id] || []).map((comm) => (
                                                        <div key={comm.id} className={`p-3 rounded-xl text-sm ${dm ? 'bg-slate-950/60' : 'bg-slate-50'}`}>
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-bold text-xs text-indigo-400">{comm.authorName || 'Peer'}</span>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[10px] text-slate-500">{comm.createdAt ? new Date(comm.createdAt).toLocaleString() : 'Now'}</span>
                                                                    {comm.authorName === user.u_name && (
                                                                        <div className="flex gap-2">
                                                                            <button onClick={() => { setEditingCommentId(comm.id); setEditCommentText(comm.content); }} className="text-[10px] font-bold text-amber-500 hover:text-amber-400">Edit</button>
                                                                            <button onClick={() => handleDeleteComment(post.id, comm.id)} className="text-[10px] font-bold text-rose-500 hover:text-rose-400">Delete</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {editingCommentId === comm.id ? (
                                                                <div className="mt-2 flex gap-2">
                                                                    <input autoFocus type="text" value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className={`flex-1 text-xs px-2 py-1 rounded border ${dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`} />
                                                                    <button onClick={() => handleSaveEditComment(post.id, comm.id)} className="text-xs text-indigo-500 font-bold">Save</button>
                                                                    <button onClick={() => setEditingCommentId(null)} className="text-xs text-slate-500">Cancel</button>
                                                                </div>
                                                            ) : ( <p className={dm ? 'text-slate-300' : 'text-slate-700'}>{comm.content}</p> )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ----------------- */}
                                    {/* LIVE CHAT SECTION */}
                                    {/* ----------------- */}
                                    {activeChatPostId === post.id && (
                                        <div className={`mt-4 p-4 border-t border-slate-300/10 rounded-2xl flex flex-col h-64 ${dm ? 'bg-slate-950' : 'bg-slate-100'}`}>
                                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-300/10 shrink-0">
                                                <span className="text-xs font-bold text-teal-400">⚡ Live Workspace Room</span>
                                                <button onClick={() => setActiveChatPostId(null)} className="text-xs text-slate-500 hover:text-rose-400">Close</button>
                                            </div>
                                            <div className="flex gap-2 mb-3 shrink-0">
                                                <input type="text" value={chatInputs[post.id] || ''} onChange={(e) => setChatInputs(prev => ({ ...prev, [post.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(post.id); }} placeholder="Type real-time ping..." className={`flex-1 text-xs rounded-lg px-3 py-1.5 focus:outline-none ${dm ? 'bg-slate-900 text-white' : 'bg-white'}`} />
                                                <button onClick={() => handleSendChatMessage(post.id)} className="px-3 bg-teal-600 text-white rounded-lg text-xs font-bold">Send</button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
                                                {(postChatMessages[post.id] || []).length === 0 ? (
                                                    <p className="text-slate-500 italic text-center pt-4">No live pings yet. Send a message to start.</p>
                                                ) : (
                                                    (postChatMessages[post.id] || []).map(m => (
                                                        <div key={m.id} className="leading-tight">
                                                            <strong className="text-teal-400">{m.senderName}: </strong>
                                                            <span className={dm ? 'text-slate-300' : 'text-slate-700'}>{m.message}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* ========================================== */}
            {/* 11. CREATE/EDIT GUIDE MODAL */}
            {/* ========================================== */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border flex flex-col max-h-[85vh] ${dm ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                        <div className="p-6 border-b border-slate-300/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editingPostId ? 'Edit Path Blueprint' : 'Forge Path Blueprint'}</h2>
                            <button onClick={resetModal} className="text-slate-400 hover:text-rose-500 font-bold text-lg">✕</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-5 flex-1">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Guide Title</label>
                                <input type="text" value={guideTitle} onChange={(e) => setGuideTitle(e.target.value)} placeholder="e.g. How to set up a MySQL database" className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${dm ? 'bg-slate-950 border-slate-800 focus:ring-indigo-500/30' : 'bg-slate-50 border-slate-200 focus:ring-[#0f1d3d]/20'}`} />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Description</label>
                                <textarea value={guideDesc} onChange={(e) => setGuideDesc(e.target.value)} rows="3" placeholder="Describe what this guide covers..." className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${dm ? 'bg-slate-950 border-slate-800 focus:ring-indigo-500/30' : 'bg-slate-50 border-slate-200 focus:ring-[#0f1d3d]/20'}`} />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Associated Skill</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {skills.map(s => (
                                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold flex items-center gap-1.5">
                                            {s}
                                            <button onClick={() => removeSkill(s)}>✕</button>
                                        </span>
                                    ))}
                                </div>
                                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} placeholder="Type a skill and press Enter..." className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 ${dm ? 'bg-slate-950 border-slate-800 focus:ring-indigo-500/30' : 'bg-slate-50 border-slate-200 focus:ring-[#0f1d3d]/20'}`} />
                            </div>
                            
                            <div className="pt-4 border-t border-slate-300/10">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold uppercase tracking-wider">Path Resources</h4>
                                    <button type="button" onClick={addStepCard} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10">➕ Add Step Card</button>
                                </div>
                                <div className="space-y-4">
                                    {steps.map((step, index) => (
                                        <div key={step.id} className={`p-4 border rounded-2xl relative flex flex-col gap-3 ${dm ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
                                            <button onClick={() => removeStepCard(step.id)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 font-bold">✕</button>
                                            <span className="text-xs font-bold text-slate-400 uppercase">Step #{index + 1}</span>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <input type="text" placeholder="Resource Title" value={step.title} onChange={(e) => updateStepField(step.id, 'title', e.target.value)} className={`sm:col-span-2 px-3 py-2 text-xs border rounded-lg focus:outline-none ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} />
                                                <select value={step.type} onChange={(e) => updateStepField(step.id, 'type', e.target.value)} className={`px-3 py-2 text-xs border rounded-lg focus:outline-none font-semibold ${dm ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200'}`}>
                                                    <option value="video">📺 Video</option>
                                                    <option value="article">📄 Text</option>
                                                    <option value="pdf">📁 PDF File</option>
                                                    <option value="code">💻 Repository</option>
                                                </select>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row gap-3 items-center">
                                                <input type="url" placeholder="URL Link (https://...)" value={step.url} onChange={(e) => updateStepField(step.id, 'url', e.target.value)} className={`w-full sm:flex-1 px-3 py-2 text-xs border rounded-lg focus:outline-none ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`} />
                                                <span className="text-xs font-bold text-slate-500 uppercase">OR</span>
                                                <label className={`w-full sm:w-auto cursor-pointer px-4 py-2 border rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${dm ? 'bg-slate-800 border-slate-700 text-indigo-400' : 'bg-slate-200 border-slate-300 text-indigo-600'}`}>
                                                    📁 Attach File
                                                    <input type="file" className="hidden" accept="*/*" onChange={(e) => updateStepField(step.id, 'file', e.target.files[0])} />
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
                        
                        <div className="p-6 border-t border-slate-300/10 flex justify-end gap-3">
                            <button onClick={resetModal} className={`px-5 py-2.5 rounded-xl text-sm font-bold border ${dm ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'}`}>Cancel</button>
                            <button onClick={handlePublishOrEditGuide} disabled={isPublishing || !guideTitle.trim() || steps.length === 0} className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${dm ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-[#0f1d3d] hover:bg-[#192f61]'}`}>
                                {isPublishing ? 'Transmitting...' : editingPostId ? 'Save Blueprint' : 'Publish Roadmap'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}