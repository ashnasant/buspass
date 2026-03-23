import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PublicVerify = () => {
    const { passId } = useParams();
    const [pass, setPass] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPassDetails = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('passes')
                    .select(`
                        *,
                        routes (
                            name
                        )
                    `)
                    .eq('id', passId)
                    .single();

                if (fetchError || !data) throw fetchError || new Error('Not found');

                setPass({
                    ...data,
                    route_name: data.routes ? data.routes.name : 'Unknown'
                });
            } catch (err) {
                console.error('Public verify error:', err);
                setError('Invalid or expired bus pass.');
            } finally {
                setLoading(false);
            }
        };
        if (passId) fetchPassDetails();
    }, [passId]);

    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-gradient)' }}>
            <div className="loader" style={{ color: 'white', fontSize: '20px' }}>Verifying Pass...</div>
        </div>
    );

    if (error) return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-gradient)', padding: '20px' }}>
            <div className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
                <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Verification Failed</h2>
                <p style={{ color: 'var(--text-muted)' }}>{error}</p>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '30px', textDecoration: 'none' }}>Back to Home</Link>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '450px', width: '100%', background: '#1e293b', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Status Header */}
                <div style={{ background: '#059669', padding: '30px', textAlign: 'center', color: 'white', position: 'relative' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', opacity: 0.9, letterSpacing: '3px', marginBottom: '8px', textTransform: 'uppercase' }}>OFFICIAL VERIFICATION</div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>✓ Valid Bus Pass</h2>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(rgba(255,255,255,0.1), transparent)', pointerEvents: 'none' }}></div>
                </div>

                <div style={{ padding: '40px 30px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                        <div style={{ 
                            width: '130px', height: '160px', borderRadius: '24px', overflow: 'hidden', 
                            border: '3px solid #10b981', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
                            marginBottom: '20px', background: '#334155'
                        }}>
                            {pass.photo_url ? (
                                <img src={pass.photo_url} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '50px' }}>👤</div>
                            )}
                        </div>
                        <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>{pass.student_name}</h3>
                        <div style={{ 
                            background: 'rgba(16, 185, 129, 0.1)', 
                            color: '#10b981', 
                            padding: '4px 16px', 
                            borderRadius: '20px', 
                            fontSize: '13px', 
                            fontWeight: '700',
                            letterSpacing: '1px'
                        }}>
                            {pass.roll_no} • {pass.dept}
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '24px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: '600' }}>Verification Date</span>
                            <span style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: '600' }}>Route Name</span>
                            <span style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>{pass.route_name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: '600' }}>Validity Period</span>
                            <span style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>{new Date(pass.valid_from).toLocaleDateString()} - {new Date(pass.valid_to).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: '600' }}>Digital Pass ID</span>
                            <span style={{ color: '#10b981', fontWeight: '800', fontSize: '13px', letterSpacing: '0.5px' }}>{pass.id}</span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '28px' }}>
                        <div style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '32px', color: 'white', marginBottom: '8px', opacity: 0.9 }}>
                            Nithin N
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Digitally Verified by BusID+
                        </div>
                    </div>
                </div>

                <Link to="/" style={{ 
                    display: 'block', 
                    background: 'rgba(255,255,255,0.02)', 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#94a3b8', 
                    textDecoration: 'none', 
                    fontSize: '13px', 
                    fontWeight: '600',
                    borderTop: '1px solid rgba(255,255,255,0.05)'
                }}>
                    ← Back to Official Portal
                </Link>
            </div>
        </div>
    );
};

export default PublicVerify;
