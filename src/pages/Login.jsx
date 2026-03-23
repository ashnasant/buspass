import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const Login = () => {
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'student'; // Default to student if not specified
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Handle Static Admin Login (as defined in previous backend)
        const ADMIN_EMAIL = 'www.nithinnibin@gmail.com';
        const ADMIN_PASS = 'nithin@2005';

        if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
            if (role && role !== 'admin') {
                setError('This account is for Administrators only.');
                return;
            }
            
            // Try fetching from DB to get latest name/avatar
            const { data: dbAdmin } = await supabase
                .from('users')
                .select('*')
                .eq('id', 'ADMIN_01')
                .single();

            const adminUser = dbAdmin || { 
                id: 'ADMIN_01', 
                name: 'Nithin N', 
                email: ADMIN_EMAIL, 
                role: 'admin',
                dept: 'ADMINISTRATION'
            };
            
            login(adminUser);
            navigate('/dashboard');
            return;
        }

        try {
            const { data: user, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('password', password)
                .single();

            if (fetchError || !user) {
                setError('Invalid email or password');
                return;
            }

            // Role Separation Check
            if (role && user.role !== role) {
                setError(`Invalid credentials for ${role} portal.`);
                return;
            }

            login(user);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed. Please check your connection or credentials.');
        }
    };

    return (
        <div className="auth-page" style={{ background: 'var(--bg-gradient)' }}>
            <div className="auth-card" style={{ backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)' }}>
                <div className="auth-logo">
                    <div style={{ 
                        width: '70px', height: '70px', background: 'white', color: '#0d3270', 
                        borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
                    <div className="badge badge-primary" style={{ display: 'inline-block', marginBottom: '12px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', background: 'var(--primary)', color: 'white' }}>
                        {role} PORTAL
                    </div>
                    <h2 className="auth-title" style={{ color: 'var(--primary)' }}>BusID Login</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>
                        {role === 'admin' 
                            ? 'Enter administrative credentials to manage the system.' 
                            : 'Sign in to your student account to manage your bus pass.'}
                    </p>
                </div>

                {error && <div className="alert alert-danger" style={{ textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="mt-4" autoComplete="off">
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            placeholder={role === 'admin' ? "admin@college.edu" : "your.email@college.edu"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                            autoComplete="off"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            autoComplete="off"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" style={{ padding: '14px', borderRadius: '12px' }}>
                        Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                </form>

                {role === 'student' && (
                    <>
                        <div className="separator" style={{ margin: '32px 0' }}></div>
                        <div className="text-center">
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>New student? Register for an account.</p>
                            <Link to="/register" className="btn btn-secondary w-full" style={{ textDecoration: 'none', borderRadius: '12px' }}>
                                Create Student Account
                            </Link>
                        </div>
                    </>
                )}

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <Link to="/" style={{ fontSize: '14px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
