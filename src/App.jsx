import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Apply from './pages/Apply';
import Applications from './pages/Applications';
import Passes from './pages/Passes';
import Verify from './pages/Verify';
import Register from './pages/Register';
import RegisterAdmin from './pages/RegisterAdmin';
import ManageRoutes from './pages/ManageRoutes';
import ApprovedStudents from './pages/ApprovedStudents';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import PublicVerify from './pages/PublicVerify';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import './index.css';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="app">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="main-content">
                <Topbar onMenuClick={() => setIsOpen(!isSidebarOpen)} />
                <div className="page">
                    {children}
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/register-admin" element={<RegisterAdmin />} />
                    <Route path="/verify-pass/:passId" element={<PublicVerify />} />
                    <Route 
                        path="/*" 
                        element={
                            <ProtectedRoute>
                                <Routes>
                                    <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
                                    <Route path="/apply" element={<MainLayout><Apply /></MainLayout>} />
                                    <Route path="/applications" element={<MainLayout><Applications /></MainLayout>} />
                                    <Route path="/routes" element={<MainLayout><ManageRoutes /></MainLayout>} />
                                    <Route path="/users" element={<MainLayout><ApprovedStudents /></MainLayout>} />
                                    <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
                                    <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
                                    <Route path="/passes" element={<MainLayout><Passes /></MainLayout>} />
                                    <Route path="/verify" element={<MainLayout><Verify /></MainLayout>} />
                                    <Route path="*" element={<Navigate to="/dashboard" />} />
                                </Routes>
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
