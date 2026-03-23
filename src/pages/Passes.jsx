import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

const Passes = () => {
    const { user } = useAuth();
    const [passes, setPasses] = useState([]);
    const passRef = useRef(null);

    useEffect(() => {
        if (user?.id) fetchPasses();
    }, [user?.id]);

    const fetchPasses = async () => {
        // We join with users to get semester and routes to get route name/stops
        let query = supabase
            .from('passes')
            .select(`
                *,
                users (semester),
                routes (name, stops)
            `);
        
        if (user.role !== 'admin') {
            query = query.eq('student_id', user.id);
        }
        
        try {
            const { data, error } = await query.order('issued_at', { ascending: false });
            if (error) throw error;
            
            // Format data for easier use
            const formatted = data.map(p => ({
                ...p,
                semester: p.users?.semester || 'N/A',
                route_name: p.routes?.name || 'Unknown Route',
                route_stops: p.routes?.stops || ''
            }));
            
            setPasses(formatted || []);
        } catch (err) {
            console.error('Failed to fetch passes:', err);
        }
    };

    const downloadPass = async (id) => {
        const element = document.getElementById(`pass-card-${id}`);
        if (!element) return;
        
        try {
            const canvas = await html2canvas(element, {
                scale: 3, // High quality
                useCORS: true,
                backgroundColor: null,
            });
            const link = document.createElement('a');
            link.download = `BusPass_${id}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download pass. Please try again.');
        }
    };

    return (
        <div className="page">
            <div className="card" style={{ background: 'transparent', boxShadow: 'none', padding: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h3 className="card-title" style={{ margin: 0 }}>{user.role === 'admin' ? 'Recent Passes' : 'My Digital Bus Pass'}</h3>
                        <p className="card-sub" style={{ margin: '5px 0 0' }}>Present this pass to the verification staff</p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
                    {passes.length > 0 ? passes.map(pass => (
                        <div key={pass.id} style={{ maxWidth: '450px', width: '100%' }}>
                            {/* THE BUS PASS CARD */}
                            <div 
                                id={`pass-card-${pass.id}`}
                                className="new-bus-pass" 
                                style={{ 
                                    background: '#1a1d21', 
                                    borderRadius: '24px', 
                                    overflow: 'hidden', 
                                    padding: '0',
                                    color: 'white',
                                    fontFamily: "'Inter', sans-serif",
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    position: 'relative'
                                }}
                            >
                                {/* Top Glow Bar */}
                                <div style={{ height: '4px', background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%)', opacity: 0.8 }}></div>
                                
                                {/* Header Section */}
                                <div style={{ padding: '24px 28px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '1.5px', color: 'white' }}>STATE COLLEGE OF ENGINEERING</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                                            Monthly Bus Pass • {new Date(pass.issued_at).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        background: 'rgba(40, 167, 69, 0.2)', 
                                        color: '#28a745', 
                                        padding: '4px 12px', 
                                        borderRadius: '20px', 
                                        fontSize: '11px', 
                                        fontWeight: '800', 
                                        border: '1px solid rgba(40, 167, 69, 0.3)',
                                        letterSpacing: '1px'
                                    }}>
                                        ACTIVE
                                    </div>
                                </div>

                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 28px' }}></div>

                                {/* Body Section */}
                                <div style={{ padding: '24px 28px' }}>
                                    <div style={{ display: 'flex', gap: '24px', marginBottom: '28px' }}>
                                        {/* Photo Box */}
                                        <div style={{ 
                                            width: '100px', 
                                            height: '110px', 
                                            borderRadius: '16px', 
                                            overflow: 'hidden', 
                                            border: '2px solid #00d2ff',
                                            background: '#2d3238',
                                            flexShrink: 0
                                        }}>
                                            {pass.photo_url ? (
                                                <img 
                                                    src={pass.photo_url} 
                                                    alt="Student" 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    crossOrigin="anonymous"
                                                />
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '40px' }}>👤</div>
                                            )}
                                        </div>

                                        {/* Details Grid */}
                                        <div style={{ flexGrow: 1 }}>
                                            <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', color: '#fff' }}>{pass.student_name}</h2>
                                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#00d2ff', marginBottom: '16px', letterSpacing: '1px' }}>{pass.id}</div>
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                <div>
                                                    <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>REG NO</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{pass.roll_no}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DEPT</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{pass.dept}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ROUTE</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{pass.route_id}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SEMESTER</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{pass.semester}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Section inside card */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                                        <div>
                                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>{pass.route_name}</div>
                                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>
                                                Valid: {new Date(pass.valid_from).toLocaleDateString()} — {new Date(pass.valid_to).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {/* QR Code */}
                                        <div style={{ 
                                            padding: '8px', 
                                            background: 'white', 
                                            borderRadius: '12px', 
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <QRCodeSVG value={window.location.origin + '/verify-pass/' + pass.id} size={72} />
                                        </div>
                                    </div>
                                </div>

                                {/* Anti-Share Protection Bar */}
                                <div style={{ 
                                    background: 'rgba(255,255,255,0.05)', 
                                    padding: '12px 28px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: 'rgba(255,255,255,0.7)',
                                    borderTop: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <span>⚠️</span> Anti-Share Protected
                                </div>
                            </div>

                            {/* Actions below the card */}
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => downloadPass(pass.id)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '14px', background: '#2d3238', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    📥 Download digital pass
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-muted" style={{ padding: '40px', textAlign: 'center', width: '100%', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎫</div>
                            <h3>No active passes found</h3>
                            <p>Once your application is approved, your digital pass will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Passes;
