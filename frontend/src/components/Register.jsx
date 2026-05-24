import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    // Read the saved theme from localStorage as soon as the page loads
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
        }
    }, []);

    // Save theme to localStorage whenever the user flips the switch
    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Client-side validation: Check if passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/register', { 
                name: fullName, 
                email, 
                password 
            });

            setSuccess("🎉 Account created successfully! Redirecting to login...");
            
            // Wait 2 seconds so they can see the success badge, then push to Login screen
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-700 bg-slate-900">
            
            {/* 🎞️ Cross-fading Smooth Mesh Background Layers */}
            <div className={`absolute inset-0 mesh-base transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/50 ${darkMode ? 'opacity-0' : 'opacity-100'}`}></div>
            <div className={`absolute inset-0 mesh-base transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 ${darkMode ? 'opacity-100' : 'opacity-0'}`}></div>
            
            {/* 🛸 Complex Educational Background Math Doodles (Vivid True-Color System Locked) */}
            {/* 1. Coding Bracket */}
            <div className={`absolute top-20 left-[12%] text-8xl font-mono select-none pointer-events-none transition-all duration-700 animate-float-1 ${darkMode ? 'text-slate-100/20' : 'text-[#0f1d3d]'}`}>
                {"{"}
            </div>
            
            {/* 2. Logic Gateway Ring */}
            <div className={`absolute bottom-24 right-[10%] w-24 h-24 border-4 border-dashed rounded-full pointer-events-none animate-float-2 transition-all duration-700 ${darkMode ? 'border-slate-100/20' : 'border-[#0f1d3d]'}`}></div>
            
            {/* 3. Visual Pie/Data Chart Compound */}
            <svg className={`absolute top-16 right-[18%] w-16 h-16 pointer-events-none animate-float-1 transition-all duration-700 ${darkMode ? 'text-slate-100/20' : 'text-[#0f1d3d]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>

            {/* 📐 4. Architectural Measurement Ruler */}
            <svg className={`absolute bottom-20 left-[18%] w-24 h-12 pointer-events-none rotate-12 animate-float-2 transition-all duration-700 ${darkMode ? 'text-slate-100/20' : 'text-[#0f1d3d]'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 100 40">
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

            {/* 5. Math Variable Equation Text */}
            <div className={`absolute top-[40%] right-[8%] font-serif italic text-4xl select-none pointer-events-none animate-float-2 transition-all duration-700 ${darkMode ? 'text-slate-100/20' : 'text-[#0f1d3d]'}`}>
                x = y²
            </div>

            {/* 6. Binary Code Bit Cluster */}
            <div className={`absolute bottom-[45%] left-[6%] font-mono text-xl tracking-widest select-none pointer-events-none animate-float-1 transition-all duration-700 ${darkMode ? 'text-slate-100/20' : 'text-[#0f1d3d]'}`}>
                101011
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo Heading */}
                <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-xl mb-3 shadow-lg transition-all duration-700 border
                        ${darkMode 
                            ? 'bg-white text-[#0f1d3d] border-white' 
                            : 'bg-[#0f1d3d] text-white border-indigo-900/50'
                        }`}
                    >
                        P²
                    </div>
                    <h1 className={`text-4xl font-bold tracking-tight mb-1 transition-colors duration-700 ${darkMode ? 'text-white' : 'text-[#0f1d3d]'}`}>PeerPath</h1>
                    <p className={`text-sm font-medium transition-colors duration-700 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Create your student gateway profile</p>
                </div>

                {/* Main Registration Card */}
                <div className={`rounded-2xl border shadow-2xl p-8 relative transition-all duration-700 ${darkMode ? 'bg-slate-900/85 border-slate-800 shadow-black/50' : 'bg-white/95 border-slate-200/80 shadow-slate-200/60'}`}>
                    
                    {/* 🌗 Shared Theme Toggle Flip Switch Capsule */}
                    <div className="absolute top-4 right-4">
                        <div 
                            onClick={toggleTheme}
                            className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 relative shadow-inner
                                ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] select-none transition-transform duration-300 ease-out transform
                                ${darkMode ? 'translate-x-7' : 'translate-x-0'}`}
                            >
                                {darkMode ? '🌙' : '☀️'}
                            </div>
                        </div>
                    </div>
                    
                    <h2 className={`text-2xl font-bold mb-5 transition-colors duration-700 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Register Account</h2>

                    {error && (
                        <div className="mb-4 p-3.5 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm rounded-r-lg font-medium">
                            🚫 {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3.5 bg-teal-50 border-l-4 border-teal-500 text-teal-700 text-sm rounded-r-lg font-medium">
                            🎉 {success}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Full Name Input */}
                        <div>
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 transition-colors duration-700 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                placeholder="John Doe"
                                className={`w-full px-4 py-2.5 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 placeholder:text-slate-400 shadow-inner
                                    ${darkMode 
                                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:bg-slate-950 focus:ring-indigo-500/20 focus:border-indigo-500' 
                                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:ring-[#0f1d3d]/10 focus:border-[#0f1d3d] hover:bg-slate-100/50'
                                    }`}
                            />
                        </div>

                        {/* Email Address Input */}
                        <div>
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 transition-colors duration-700 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@domain.com"
                                className={`w-full px-4 py-2.5 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 placeholder:text-slate-400 shadow-inner
                                    ${darkMode 
                                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:bg-slate-950 focus:ring-indigo-500/20 focus:border-indigo-500' 
                                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:ring-[#0f1d3d]/10 focus:border-[#0f1d3d] hover:bg-slate-100/50'
                                    }`}
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 transition-colors duration-700 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className={`w-full px-4 py-2.5 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 placeholder:text-slate-400 shadow-inner
                                    ${darkMode 
                                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:bg-slate-950 focus:ring-indigo-500/20 focus:border-indigo-500' 
                                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:ring-[#0f1d3d]/10 focus:border-[#0f1d3d] hover:bg-slate-100/50'
                                    }`}
                            />
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 transition-colors duration-700 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className={`w-full px-4 py-2.5 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 placeholder:text-slate-400 shadow-inner
                                    ${darkMode 
                                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:bg-slate-950 focus:ring-indigo-500/20 focus:border-indigo-500' 
                                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:ring-[#0f1d3d]/10 focus:border-[#0f1d3d] hover:bg-slate-100/50'
                                    }`}
                            />
                        </div>

                        {/* Submit Action Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full text-white py-3 rounded-xl font-semibold tracking-wide transition-all duration-300 shadow-lg mt-2 active:scale-[0.985]
                                ${isLoading 
                                    ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                                    : darkMode
                                        ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/40'
                                        : 'bg-[#0f1d3d] hover:bg-[#192f61] shadow-[#0f1d3d]/10 focus:outline-none focus:ring-4 focus:ring-[#0f1d3d]/30'
                                }`}
                        >
                            {isLoading ? 'Creating Gateway Access...' : 'Create Account'}
                        </button>
                    </form>
                </div>

                {/* Switch Screen Navigation Link */}
                <p className={`text-center mt-5 text-sm font-medium transition-colors duration-700 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Already have an account?{' '}
                    <button 
                        onClick={() => navigate('/login')}
                        className={`font-bold hover:underline bg-transparent border-none cursor-pointer transition-colors duration-700 ${darkMode ? 'text-indigo-400' : 'text-[#0f1d3d]'}`}
                    >
                        Sign in here
                    </button>
                </p>
            </div>
        </div>
    );
}