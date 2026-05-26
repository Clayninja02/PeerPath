import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function BlueprintViewer() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [post, setPost] = useState(null);
    const [completedSteps, setCompletedSteps] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            navigate('/feed');
            return;
        }

        let isMounted = true;

        const fetchData = async () => {
            try {
                // Fetch the post and the user's progress concurrently
                const [postData, progressData] = await Promise.all([
                    api.get(`/posts/${id}`),
                    api.get(`/posts/${id}/progress`).catch(() => ({ completedSteps: "" })) // Safe fallback if progress doesn't exist yet
                ]);

                if (isMounted && postData) {
                    setPost(postData);
                    
                    if (progressData && progressData.completedSteps && progressData.completedSteps.trim() !== '') {
                        const parsedSteps = new Set(
                            progressData.completedSteps.split(',').map(num => parseInt(num, 10))
                        );
                        setCompletedSteps(parsedSteps);
                    }
                } else if (isMounted && !postData) {
                     navigate('/feed');
                }
            } catch (error) {
                console.error("Failed to load blueprint:", error);
                if (isMounted) navigate('/feed'); 
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [id, navigate]);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const toggleStep = async (stepNumber) => {
        const newCompleted = new Set(completedSteps);
        
        if (newCompleted.has(stepNumber)) {
            newCompleted.delete(stepNumber);
        } else {
            newCompleted.add(stepNumber);
        }
        
        setCompletedSteps(newCompleted);

        const completedString = Array.from(newCompleted).join(',');
        
        try {
            await api.post(`/posts/${id}/progress`, { completedSteps: completedString });
        } catch (error) {
            console.error("Failed to save progress:", error);
        }
    };

    if (isLoading || !post) {
        return <div className="min-h-screen flex items-center justify-center bg-[#0b1121] text-indigo-400 font-bold animate-pulse">Loading Blueprint...</div>;
    }

    const dm = darkMode;
    // Safely check for resources array
    const resources = Array.isArray(post.resources) ? post.resources : [];
    const totalSteps = resources.length;
    const completedCount = completedSteps.size;
    const progressPercentage = totalSteps === 0 ? 0 : Math.round((completedCount / totalSteps) * 100);

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-500 ${dm ? 'bg-[#0b1121] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
            
            <header className={`h-20 flex items-center justify-between px-8 border-b ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <button onClick={() => navigate(-1)} className={`w-20 font-bold flex items-center gap-2 ${dm ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'}`}>
                    <span>←</span> Back
                </button>
                <div className={`text-xl font-bold ${dm ? 'text-white' : 'text-[#0f1d3d]'}`}>PeerPath Active Session</div>
                
                <div className="w-20 flex justify-end">
                    <div onClick={toggleTheme} className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 relative shadow-inner ${dm ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] select-none transition-transform duration-300 ease-out ${dm ? 'translate-x-7' : 'translate-x-0'}`}>{dm ? '🌙' : '☀️'}</div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${dm ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                            {post.skill?.sName || 'General Engineering'}
                        </span>
                        <h1 className="text-4xl font-bold mt-4 mb-3">{post.title}</h1>
                        <p className={`text-lg max-w-2xl mx-auto ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{post.description}</p>
                    </div>

                    {totalSteps > 0 && (
                        <div className={`p-6 rounded-3xl border mb-8 shadow-sm ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className="flex justify-between items-end mb-3">
                                <div>
                                    <h3 className="font-bold text-lg">Your Progress</h3>
                                    <p className={`text-sm ${dm ? 'text-slate-500' : 'text-slate-500'}`}>{completedCount} of {totalSteps} steps completed</p>
                                </div>
                                <span className={`text-2xl font-bold ${progressPercentage === 100 ? 'text-emerald-500' : 'text-indigo-500'}`}>
                                    {progressPercentage}%
                                </span>
                            </div>
                            <div className={`w-full h-4 rounded-full overflow-hidden ${dm ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                <div 
                                    className={`h-full transition-all duration-700 ease-out ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            {progressPercentage === 100 && (
                                <p className="text-emerald-500 font-bold text-sm text-center mt-4 animate-pulse">🎉 Module Complete! Excellent work.</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        {resources.map((res, index) => {
                            const isCompleted = completedSteps.has(res.orderNumber || index + 1);
                            
                            return (
                                <div 
                                    key={res.id || index} 
                                    className={`p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
                                        isCompleted 
                                            ? (dm ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200')
                                            : (dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')
                                    }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <button 
                                            onClick={() => toggleStep(res.orderNumber || index + 1)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                                                isCompleted 
                                                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                                                    : (dm ? 'border-slate-700 hover:border-indigo-400' : 'border-slate-300 hover:border-indigo-500')
                                            }`}
                                        >
                                            {isCompleted && <span>✓</span>}
                                        </button>
                                        
                                        <div>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : (dm ? 'text-indigo-400' : 'text-indigo-600')}`}>
                                                Step {res.orderNumber || index + 1} • {res.type}
                                            </span>
                                            <h5 className={`font-bold text-lg mt-0.5 ${isCompleted && dm ? 'text-emerald-50' : ''}`}>
                                                {res.title}
                                            </h5>
                                        </div>
                                    </div>

                                    {res.url && (
                                        <a 
                                            href={res.url} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 ${
                                                isCompleted
                                                    ? (dm ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white')
                                                    : (dm ? 'bg-indigo-600 text-white' : 'bg-[#0f1d3d] text-white')
                                            }`}
                                        >
                                            View Material
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}