import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const RegisterAdmin = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
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
            id: 'ADM' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            role: 'admin'
        };

        try {
            // Check if email exists
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('email', formData.email);

            if (existing && existing.length > 0) {
                setError('Email already registered');
                return;
            }

            const { error: insertError } = await supabase
                .from('users')
                .insert([userData]);

            if (insertError) throw insertError;

            setSuccess('Admin registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error('Admin Registration error:', err);
            setError('Registration failed: ' + err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '480px' }}>
                <div className="auth-logo">
                    <div style={{ 
                        width: '60px', height: '60px', background: '#dc3545', color: 'white', 
                        borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: '28px', fontWeight: '800', margin: '0 auto 20px'
                    }}>A+</div>
                    <h2 className="auth-title">Admin Setup</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Create an administrative account</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" name="name" className="form-input" placeholder="Admin Name" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className="form-input" placeholder="admin@college.com" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-input" placeholder="••••••••" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mobile Number</label>
                        <input type="text" name="phone" className="form-input" placeholder="Verification Phone" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ padding: '14px', backgroundColor: '#dc3545' }}>Register Admin Account</button>
                </form>

                <div className="separator" style={{ margin: '32px 0' }}></div>
                
                <div className="text-center">
                    <Link to="/login" className="btn btn-secondary w-full" style={{ textDecoration: 'none' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterAdmin;
