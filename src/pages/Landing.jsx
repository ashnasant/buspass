import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    return (
        <div className="landing-container">
            <div className="landing-overlay"></div>

            <header className="landing-header">
                <div className="college-logo">
                    <div className="logo-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0d3270" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
                </div>
                <p className="college-name">GOVERNMENT ENGINEERING COLLEGE IDUKKI</p>
            </header>

            <main className="landing-main">
                <h1 className="landing-title">BusID – Digital College Bus Pass</h1>
                <p className="landing-subtitle">
                    A seamless, paperless bus pass management system for students and administrators.
                </p>

                <div className="portal-cards">
                    <Link to="/login?role=student" className="portal-card">
                        <div className="portal-icon-container">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0d3270" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                            </svg>
                        </div>
                        <p className="portal-access-label">PORTAL ACCESS</p>
                        <h2 className="portal-role-title">Student Login</h2>
                        <p className="portal-description">
                            Apply for bus pass, track status & view your digital ID
                        </p>
                    </Link>

                    <Link to="/login?role=admin" className="portal-card">
                        <div className="portal-icon-container">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0d3270" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M12 8v4" />
                                <path d="M12 16h.01" />
                            </svg>
                        </div>
                        <p className="portal-access-label">PORTAL ACCESS</p>
                        <h2 className="portal-role-title">Admin Login</h2>
                        <p className="portal-description">
                            Review applications, approve passes & manage routes
                        </p>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Landing;
