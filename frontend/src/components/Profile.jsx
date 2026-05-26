import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Profile() {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [user] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')) || { u_name: 'Student', email: '' }; }
        catch { return { u_name: 'Student', email: '' }; }
    });

    const [activeTab, setActiveTab] = useState('my-blueprints'); 
    const [myPosts, setMyPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        let isMounted = true;
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                const [myPostsData, savedPostsData] = await Promise.all([
                    api.get('/posts/me'),
                    api.get('/posts/saved')
                ]);
                
                if (isMounted) {
                    setMyPosts(myPostsData || []);
                    setSavedPosts(savedPostsData || []);
                }
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchProfileData();
        return () => { isMounted = false; };
    }, [navigate]);

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

    const handleRemoveBookmark = async (postId) => {
        try {
            await api.post(`/posts/${postId}/follow`);
            setSavedPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) {
            console.error("Failed to remove bookmark:", error);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to permanently delete this blueprint?")) return;
        try {
            await api.delete(`/posts/${postId}`);
            setMyPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) {
            alert('Failed to delete post: ' + error.message);
        }
    };

    const dm = darkMode;
    const currentData = activeTab === 'my-blueprints' ? myPosts : savedPosts;

    return (
        <div className={`min-h-screen flex transition-colors duration-500 ${dm ? 'bg-[#0b1121] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
            
            <aside className={`w-72 fixed h-full border-r flex flex-col z-20 transition-colors duration-500 ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className={`h-20 flex items-center gap-3 px-6 border-b ${dm ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-lg shadow-md ${dm ? 'bg-white text-[#0f1d3d]' : 'bg-[#0f1d3d] text-white'}`}>P²</div>
                    <span className={`text-2xl font-bold tracking-tight ${dm ? 'text-white' : 'text-[#0f1d3d]'}`}>PeerPath</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <button onClick={() => navigate('/feed')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${dm ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-[#0f1d3d]'}`}>
                        <span className="text-xl">🏠</span> Home
                    </button>
                    <button onClick={() => {}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${dm ? 'bg-indigo-600 text-white shadow-md' : 'bg-[#0f1d3d] text-white shadow-md'}`}>
                        <span className="text-xl">👤</span> My Profile
                    </button>
                </nav>
            </aside>

            <main className="flex-1 ml-72 flex flex-col h-screen overflow-hidden">
                <header className={`h-20 flex items-center justify-between px-8 border-b z-10 transition-colors duration-500 ${dm ? 'bg-slate-900/80 border-slate-800 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md'}`}>
                    <h1 className={`text-xl font-bold ${dm ? 'text-white' : 'text-slate-800'}`}>Profile Center</h1>
                    <div className="flex items-center gap-6">
                        <div onClick={toggleTheme} className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 relative shadow-inner ${dm ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] select-none transition-transform duration-300 ease-out ${dm ? 'translate-x-7' : 'translate-x-0'}`}>{dm ? '🌙' : '☀️'}</div>
                        </div>
                        <div className="flex items-center gap-4 pl-6 border-l border-slate-300/30">
                            <button onClick={handleLogout} className={`text-sm font-bold transition-colors ${dm ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-500'}`}>Logout</button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">
                        
                        <div className={`p-8 rounded-3xl border mb-8 shadow-sm flex items-center gap-6 ${dm ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center font-bold text-4xl shadow-inner ${dm ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                {user.u_name ? user.u_name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-1">{user.u_name}</h2>
                                <p className={`font-medium ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{user.email || 'Engineering Student'}</p>
                                <div className="flex gap-4 mt-3">
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${dm ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                                        {myPosts.length} Blueprints Authored
                                    </span>
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${dm ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                                        {savedPosts.length} Materials Saved
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-6 border-b border-slate-300/20 pb-4">
                            <button 
                                onClick={() => setActiveTab('my-blueprints')}
                                className={`px-4 py-2 font-bold rounded-xl transition-all ${activeTab === 'my-blueprints' ? (dm ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900') : (dm ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                            >
                                📐 My Blueprints
                            </button>
                            <button 
                                onClick={() => setActiveTab('saved')}
                                className={`px-4 py-2 font-bold rounded-xl transition-all ${activeTab === 'saved' ? (dm ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900') : (dm ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                            >
                                💾 Saved Materials
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12"><p className="text-slate-500 animate-pulse">Loading secure data module...</p></div>
                        ) : currentData.length === 0 ? (
                            <div className="text-center py-16 p-6 rounded-3xl border border-dashed border-slate-300/30">
                                <p className="text-slate-500 font-medium">
                                    {activeTab === 'my-blueprints' ? "You haven't authored any blueprints yet." : "You haven't bookmarked any materials yet."}
                                </p>
                                {activeTab === 'my-blueprints' && (
                                    <button onClick={() => navigate('/feed')} className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500">
                                        Head to Feed to Create One
                                    </button>
                                )}
                            </div>
                        ) : (
                            currentData.map(post => (
                                <div key={post.id} className={`p-5 rounded-2xl border mb-4 flex justify-between items-center transition-all hover:scale-[1.01] ${dm ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${dm ? 'bg-slate-800 text-indigo-400' : 'bg-slate-100 text-[#0f1d3d]'}`}>
                                                {post.skill?.sName || 'General'}
                                            </span>
                                            <span className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-bold text-lg">{post.title}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">{post.description}</p>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 shrink-0">
                                        {activeTab === 'my-blueprints' ? (
                                            <button onClick={() => handleDeletePost(post.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20">
                                                Delete
                                            </button>
                                        ) : (
                                            <button onClick={() => handleRemoveBookmark(post.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20">
                                                Unsave
                                            </button>
                                        )}
                                        
                                        {/* FIX: Ensure we only navigate if post.id exists */}
                                        <button onClick={() => { if (post.id) navigate(`/blueprint/${post.id}`); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-transform hover:scale-105 ${dm ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-[#0f1d3d] hover:bg-[#1a2f5c]'}`}>
                                            📖 Start Roadmap
                                        </button>

                                        <button onClick={() => navigate('/feed')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${dm ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-black'}`}>
                                            View in Feed
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}