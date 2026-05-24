import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Feed from './components/Feed';

// Placeholder for the upcoming Profile Dashboard
const ProfilePlaceholder = () => (
  <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
    <h1 className="text-3xl font-bold">Personal Dashboard coming soon!</h1>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Application Routes */}
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile" element={<ProfilePlaceholder />} />
      </Routes>
    </Router>
  );
}