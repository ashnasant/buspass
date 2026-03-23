import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('busid_user');
        window.location.href = '/';
    };

    const closeSidebarMobile = () => {
        if (window.innerWidth <= 768) {
            setIsOpen(false);
        }
    };

    const navItems = {
        admin: [
            { path: '/dashboard', icon: '📊', label: 'Dashboard' },
            { path: '/applications', icon: '📝', label: 'Applications' },
            { path: '/routes', icon: '🛣️', label: 'Manage Routes' },
            { path: '/users', icon: '🎓', label: 'Approved Students' },
            { path: '/settings', icon: '⚙️', label: 'Settings' },
        ],
        student: [
            { path: '/dashboard', icon: '📊', label: 'Dashboard' },
            { path: '/apply', icon: '📋', label: 'Apply for Pass' },
            { path: '/passes', icon: '🎫', label: 'My Pass' },
            { path: '/settings', icon: '⚙️', label: 'Settings' },
        ],
        verifier: [
            { path: '/verify', icon: '🔍', label: 'Verify Pass' },
        ]
    };

    const items = navItems[user?.role] || [];

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}></div>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="logo-icon" style={{ 
                        background: 'var(--bg-gradient)', padding: '10px', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 17h1" />
                            <path d="M8 17h8" />
                            <path d="M19 17h1" />
                            <path d="M16 6H4a2 2 0 0 0-2 2v7h1" />
                            <path d="M16 6h2s1.5.5 2.5 1.5S22 10 22 12v3h-1" />
                            <circle cx="6.5" cy="17" r="2.5" />
                            <circle cx="17.5" cy="17" r="2.5" />
                            <path d="M7 6v6" />
                            <path d="M11 6v6" />
                            <path d="M15 6v6" />
                            <path d="M2 11h20" />
                        </svg>
                    </div>
                    <div className="logo-text" style={{ fontSize: '22px', fontWeight: '800', color: '#0d3270' }}>BusID<span style={{ color: 'var(--primary)' }}></span></div>
                </div>
                <nav className="nav-section">
                    {items.map(item => (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={closeSidebarMobile}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid #eee' }}>
                    <div className="nav-item" onClick={() => { handleLogout(); closeSidebarMobile(); }} style={{ cursor: 'pointer', color: '#dc3545' }}>
                        <span className="nav-icon">🚪</span>
                        <span>Logout</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
