import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Roadmaps() {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [user] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')) || { u_name: 'Student' }; }
        catch { return { u_name: 'Student' }; }
    });

    const [activeRoadmaps, setActiveRoadmaps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        let isMounted = true;
        const fetchRoadmaps = async () => {
            try {
                const data = await api.get('/posts/roadmaps');
                if (isMounted) setActiveRoadmaps(data || []);
            } catch (error) {
                console.error("Failed to load roadmaps:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchRoadmaps();
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

    const dm = darkMode;

    return (
        <div className={`min-h-screen flex transition-colors duration-500 ${dm ? 'bg-[#0b1121] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
            
            {/* SIDEBAR */}
            <aside className={`w-72 fixed h-full border-r flex flex-col z-20 transition-colors duration-500 ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className={`h-20 flex items-center gap-3 px-6 border-b ${dm ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-lg shadow-md ${dm ? 'bg-white text-[#0f1d3d]' : 'bg-[#0f1d3d] text-white'}`}>P²</div>
                    <span className={`text-2xl font-bold tracking-tight ${dm ? 'text-white' : 'text-[#0f1d3d]'}`}>PeerPath</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <button onClick={() => navigate('/feed')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${dm ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-[#0f1d3d]'}`}>
                        <span className="text-xl">🏠</span> Home Feed
                    </button>
                    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${dm ? 'bg-indigo-600 text-white shadow-md' : 'bg-[#0f1d3d] text-white shadow-md'}`}>
                        <span className="text-xl">📐</span> Peer Roadmaps
                    </button>
                    <button onClick={() => navigate('/profile', { state: { tab: 'saved' } })} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${dm ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-[#0f1d3d]'}`}>
                        <span className="text-xl">💾</span> Saved Materials
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-72 flex flex-col h-screen overflow-hidden">
                {/* HEADER */}
                <header className={`h-20 flex items-center justify-between px-8 border-b z-10 transition-colors duration-500 ${dm ? 'bg-slate-900/80 border-slate-800 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md'}`}>
                    <div>
                        <h1 className={`text-xl font-bold capitalize ${dm ? 'text-white' : 'text-slate-800'}`}>Active Roadmaps</h1>
                        <p className={`text-sm font-medium ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Track your learning progress</p>
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

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto">
                        
                        {isLoading ? (
                            <div className="text-center py-12"><p className="text-slate-500 animate-pulse">Calculating active path data...</p></div>
                        ) : activeRoadmaps.length === 0 ? (
                            <div className="text-center py-16 p-6 rounded-3xl border border-dashed border-slate-300/30 mt-10">
                                <span className="text-4xl block mb-4">🗺️</span>
                                <h3 className="text-xl font-bold mb-2">No Active Roadmaps</h3>
                                <p className="text-slate-500 font-medium mb-6">
                                    You haven't started tracking any blueprints yet.
                                </p>
                                <button onClick={() => navigate('/feed')} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md hover:scale-105 transition-transform">
                                    Explore the Feed
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeRoadmaps.map((item, index) => {
                                    const post = item.post;
                                    const completedString = item.completedSteps || "";
                                    
                                    // Math for the mini progress bar
                                    const totalSteps = post.resources ? post.resources.length : 0;
                                    const completedCount = completedString ? completedString.split(',').length : 0;
                                    const progressPercentage = totalSteps === 0 ? 0 : Math.round((completedCount / totalSteps) * 100);
                                    const isDone = progressPercentage === 100;

                                    return (
                                        <div key={post.id || index} className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between transition-all hover:scale-[1.02] ${isDone ? (dm ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200') : (dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}`}>
                                            
                                            <div>
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${dm ? 'bg-slate-800 text-indigo-400' : 'bg-slate-100 text-[#0f1d3d]'}`}>
                                                        {post.skill?.sName || 'General'}
                                                    </span>
                                                    {isDone && <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">🏆 Completed</span>}
                                                </div>
                                                
                                                <h3 className="font-bold text-lg mb-2 line-clamp-1">{post.title}</h3>
                                                <p className={`text-sm mb-6 line-clamp-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{post.description}</p>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-xs font-bold mb-2">
                                                    <span className={dm ? 'text-slate-400' : 'text-slate-500'}>{completedCount} / {totalSteps} Steps</span>
                                                    <span className={isDone ? 'text-emerald-500' : 'text-indigo-500'}>{progressPercentage}%</span>
                                                </div>
                                                <div className={`w-full h-2.5 rounded-full overflow-hidden mb-6 ${dm ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                                    <div 
                                                        className={`h-full transition-all duration-700 ${isDone ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                        style={{ width: `${progressPercentage}%` }}
                                                    ></div>
                                                </div>

                                                <button 
                                                    onClick={() => navigate(`/blueprint/${post.id}`)}
                                                    className={`w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm ${isDone ? 'bg-emerald-600 hover:bg-emerald-500' : (dm ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-[#0f1d3d] hover:bg-[#1a2f5c]')}`}
                                                >
                                                    {isDone ? 'Review Module' : 'Resume Roadmap'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}