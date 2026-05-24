import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Feed from './components/Feed';

// ==========================================
// PROTECTED ROUTE WRAPPER
// Redirects to /login if no token found
// ==========================================
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

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
                <Route
                    path="/feed"
                    element={
                        <ProtectedRoute>
                            <Feed />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePlaceholder />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all: redirect unknown routes to landing page */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}