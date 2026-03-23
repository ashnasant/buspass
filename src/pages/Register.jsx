import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roll_no: '',
        dept: '',
        semester: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const userData = {
            ...formData,
            id: 'U' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            role: 'student'
        };

        try {
            // Check if email exists
            const { data: existing, error: fetchError } = await supabase
                .from('users')
                .select('id')
                .eq('email', formData.email);

            if (fetchError) throw fetchError;
            if (existing && existing.length > 0) {
                setError('Email already registered');
                return;
            }

            // Insert new user
            const { error: insertError } = await supabase
                .from('users')
                .insert([userData]);

            if (insertError) throw insertError;

            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error('Registration error:', err);
            setError('Registration failed: ' + (err.message || 'Unknown error'));
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '560px' }}>
                <div className="auth-logo">
                    <div style={{ 
                        width: '70px', height: '70px', background: 'var(--primary)', color: 'white', 
                        borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(0, 86, 179, 0.2)'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="4" y="9" width="16" height="11" rx="2"/><path d="M8 2h8a2 2 0 0 1 2 2v5H6V4a2 2 0 0 1 2-2z"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/><path d="M11 2v5"/><path d="M13 2v5"/>
                        </svg>
                    </div>
                    <h2 className="auth-title">Student Registration</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Join the digital bus pass system</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" name="name" className="form-input" placeholder="e.g. John Doe" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" name="email" className="form-input" placeholder="john@college.com" onChange={handleChange} required />
                        </div>
                    </div>
                    
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input type="password" name="password" className="form-input" placeholder="••••••••" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Registration Number</label>
                            <input type="text" name="roll_no" className="form-input" placeholder="e.g. 21CS042" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <input type="text" name="dept" className="form-input" placeholder="e.g. Computer Science" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Semester</label>
                            <input type="text" name="semester" className="form-input" placeholder="e.g. 6" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mobile Number</label>
                        <input type="text" name="phone" className="form-input" placeholder="+91 XXXXX XXXXX" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ padding: '14px', marginTop: '10px' }}>Complete Registration</button>
                </form>

                <div className="separator" style={{ margin: '32px 0' }}></div>
                
                <div className="text-center">
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Already have an account?</p>
                    <Link to="/login" className="btn btn-secondary w-full" style={{ textDecoration: 'none' }}>
                        Go to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
