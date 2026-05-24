import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    // Sync theme choice across pages using localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
        }
    }, []);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    return (
        <div className={`min-h-screen w-full relative overflow-x-hidden transition-colors duration-700 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
            
            {/* 🌌 LAYER 1: FIXED BACKGROUND GRADS (Stays in place) */}
            <div className={`fixed inset-0 mesh-base transition-opacity duration-700 pointer-events-none z-[0] bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-100/40 ${darkMode ? 'opacity-0' : 'opacity-100'}`}></div>
            <div className={`fixed inset-0 mesh-base transition-opacity duration-700 pointer-events-none z-[0] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 ${darkMode ? 'opacity-100' : 'opacity-0'}`}></div>
            
            {/* 🛸 LAYER 2: SCROLLING DOODLES (Spaced from top to bottom of the document) */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-[1] overflow-hidden">
                
                {/* --- TOP ZONE --- */}
                <div className={`absolute top-40 left-[5%] text-8xl font-mono select-none transition-colors duration-700 animate-float-1 ${darkMode ? 'text-slate-100/10' : 'text-[#0f1d3d]/30'}`}>
                    {"{"}
                </div>
                
                <div className={`absolute top-52 right-[8%] w-24 h-24 border-4 border-dashed rounded-full transition-colors duration-700 animate-float-2 ${darkMode ? 'border-slate-100/10' : 'border-[#0f1d3d]/30'}`}></div>

                {/* --- MIDDLE ZONE (Appears as you scroll to About section) --- */}
                <svg className={`absolute top-[700px] left-[8%] w-20 h-20 transition-colors duration-700 animate-float-1 ${darkMode ? 'text-slate-100/10' : 'text-[#0f1d3d]/30'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>

                <svg className={`absolute top-[850px] right-[5%] w-16 h-16 -rotate-12 transition-colors duration-700 animate-float-2 ${darkMode ? 'text-slate-100/10' : 'text-[#0f1d3d]/30'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3M4 7c0 1.657 3.582 3 8 3s8-1.343 8-3M4 7v4c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 4v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4" />
                </svg>

                {/* --- BOTTOM ZONE (Appears as you reach the footer) --- */}
                <svg className={`absolute bottom-32 left-[10%] w-24 h-12 rotate-12 transition-colors duration-700 animate-float-2 ${darkMode ? 'text-slate-100/10' : 'text-[#0f1d3d]/30'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 100 40">
                    <rect x="5" y="10" width="90" height="20" rx="2" />
                    <line x1="15" y1="10" x2="15" y2="18" />
                    <line x1="25" y1="10" x2="25" y2="15" />
                    <line x1="35" y1="10" x2="35" y2="15" />
                    <line x1="45" y1="10" x2="45" y2="15" />
                    <line x1="55" y1="10" x2="55" y2="18" />
                    <line x1="65" y1="10" x2="65" y2="15" />
                    <line x1="75" y1="10" x2="75" y2="15" />
                    <line x1="85" y1="10" x2="85" y2="15" />
                </svg>

                <svg className={`absolute bottom-52 right-[10%] w-20 h-20 transition-colors duration-700 animate-float-1 ${darkMode ? 'text-slate-100/10' : 'text-[#0f1d3d]/30'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2v20M4 12c0-4 2-8 4-8s4 8 4 8 2 8 4 8 4-4 4-8" />
                </svg>
            </div>

            {/* 📋 LAYER 3: MAIN CONTENT (Sits on top safely) */}
            
            {/* FIXED TOP NAVBAR */}
            <nav className={`fixed top-0 left-0 w-full z-50 backdrop-blur-md transition-all duration-500 border-b ${darkMode ? 'bg-slate-950/80 border-slate-800/80 shadow-md shadow-black/40' : 'bg-white/80 border-slate-200/80 shadow-sm shadow-slate-200/50'}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
                    
                    {/* Logo Area */}
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-lg transition-all duration-700 shadow-md ${darkMode ? 'bg-white text-[#0f1d3d]' : 'bg-[#0f1d3d] text-white'}`}>
                            P²
                        </div>
                        <span className={`text-2xl font-bold tracking-tight transition-colors duration-700 ${darkMode ? 'text-white' : 'text-[#0f1d3d]'}`}>
                            PeerPath
                        </span>
                    </div>
                    
                    {/* Controls & Buttons */}
                    <div className="flex items-center gap-6">
                        {/* Smooth Toggle */}
                        <div 
                            onClick={toggleTheme}
                            className={`w-16 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 relative shadow-inner ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-xs select-none transition-transform duration-300 ease-out transform ${darkMode ? 'translate-x-8' : 'translate-x-0'}`}>
                                {darkMode ? '🌙' : '☀️'}
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => navigate('/login')}
                            className={`hidden sm:block text-base font-semibold transition-colors duration-300 ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-[#0f1d3d]'}`}
                        >
                            Sign In
                        </button>
                        
                        <button 
                            onClick={() => navigate('/register')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-300 active:scale-95 ${darkMode ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30' : 'bg-[#0f1d3d] hover:bg-[#1a2d5a] shadow-[#0f1d3d]/20'}`}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <main className="relative z-10 w-full flex flex-col items-center justify-center pt-40 pb-24 px-6">
                <div className="max-w-4xl text-center">
                    <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight mb-8 transition-colors duration-700 leading-tight ${darkMode ? 'text-white' : 'text-[#0f1d3d]'}`}>
                        Coordinate, Learn & Master <br />
                        <span className="text-indigo-500">Engineering Together.</span>
                    </h1>
                    <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-12 transition-colors duration-700 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        An interactive peer-learning ecosystem built for both Students and Educators. Construct paths, trace guides, and tackle complex lab curricula with your peer network.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
                        <button 
                            onClick={() => navigate('/register')}
                            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold tracking-wide shadow-xl transition-all duration-300 transform active:scale-95 text-white ${darkMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-[#0f1d3d] hover:bg-[#192f61]'}`}
                        >
                            Create Your Free Profile
                        </button>
                        <a 
                            href="#about"
                            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold border transition-all duration-300 text-center ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800/50' : 'border-slate-300 text-slate-700 hover:bg-slate-200/50'}`}
                        >
                            Learn More ↓
                        </a>
                    </div>
                </div>
            </main>

            {/* ABOUT / FEATURES SECTION */}
            <section id="about" className="relative z-10 w-full max-w-7xl mx-auto py-24 px-6 lg:px-8 scroll-mt-24">
                <div className="text-center mb-16">
                    <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors duration-700 ${darkMode ? 'text-white' : 'text-[#0f1d3d]'}`}>
                        What is PeerPath?
                    </h2>
                    <p className={`text-base md:text-lg max-w-2xl mx-auto transition-colors duration-700 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        We bridge the gap between heavy academic engineering courses and structured student collaboration.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className={`p-8 border rounded-3xl shadow-xl transition-all duration-700 backdrop-blur-md ${darkMode ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white/80 border-slate-200/80'}`}>
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6 font-bold text-2xl">
                            📐
                        </div>
                        <h3 className={`text-2xl font-bold mb-4 transition-colors duration-700 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            Peer Roadmaps
                        </h3>
                        <p className={`text-base leading-relaxed transition-colors duration-700 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Don't study blindly. Explore or compile custom interactive learning paths for difficult lab preparations, database design structures, or complex assembly code modules.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className={`p-8 border rounded-3xl shadow-xl transition-all duration-700 backdrop-blur-md ${darkMode ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white/80 border-slate-200/80'}`}>
                        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-6 font-bold text-2xl">
                            🧬
                        </div>
                        <h3 className={`text-2xl font-bold mb-4 transition-colors duration-700 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            Real-time Feed
                        </h3>
                        <p className={`text-base leading-relaxed transition-colors duration-700 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Stay aligned with your peer network. Post updates, request assistance with networking lab setups or hardware debugging configurations, and form instant focus groups.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className={`p-8 border rounded-3xl shadow-xl transition-all duration-700 backdrop-blur-md ${darkMode ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white/80 border-slate-200/80'}`}>
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6 font-bold text-2xl">
                            📡
                        </div>
                        <h3 className={`text-2xl font-bold mb-4 transition-colors duration-700 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            Secure Access
                        </h3>
                        <p className={`text-base leading-relaxed transition-colors duration-700 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Your data integrity matters. Our Spring Boot token infrastructure keeps your connection safe, providing clean communication nodes throughout your academic cohort.
                        </p>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className={`relative z-10 py-10 border-t text-center text-sm font-medium transition-all duration-700 mt-10 ${darkMode ? 'border-slate-800/80 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
                <p>Copyright © 2026 PeerPath. All rights reserved.</p>
            </footer>
        </div>
    );
}