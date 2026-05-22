import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const RejectedStudents = () => {
    const [rejectedApps, setRejectedApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRejectedApps();
    }, []);

    const fetchRejectedApps = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    users (email),
                    routes (name)
                `)
                .eq('status', 'rejected')
                .order('reviewed_at', { ascending: false });

            if (error) throw error;

            const formatted = data.map(app => ({
                id: app.id,
                studentId: app.student_id,
                name: app.student_name,
                email: app.users?.email || 'N/A',
                roll_no: app.roll_no,
                dept: app.dept,
                semester: app.semester,
                phone: app.phone,
                route: app.routes?.name || app.route_id,
                receipt_no: app.receipt_no,
                amount: app.amount,
                remarks: app.remarks || 'No reason provided',
                reviewed_at: app.reviewed_at,
                reviewed_by: app.reviewed_by || 'Unknown Admin',
                photo_url: app.photo_url
            }));

            setRejectedApps(formatted);
        } catch (err) {
            console.error('Fetch rejected applications error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReconsider = async (app) => {
        const confirmReconsider = window.confirm(`Are you sure you want to reconsider the application for ${app.name}? This will move it back to the pending queue.`);
        if (!confirmReconsider) return;

        try {
            // Update application status back to pending
            const { error: updateError } = await supabase
                .from('applications')
                .update({
                    status: 'pending',
                    remarks: null,
                    reviewed_at: null,
                    reviewed_by: null
                })
                .eq('id', app.id);

            if (updateError) throw updateError;

            // Send notification to the student
            await supabase.from('notifications').insert([{
                user_id: app.studentId,
                title: 'Application Under Reconsideration',
                message: 'Your rejected bus pass application is being reconsidered by the admin.',
                type: 'info'
            }]);

            alert('Application sent back for reconsideration successfully!');
            fetchRejectedApps();
        } catch (err) {
            console.error('Reconsider error:', err);
            alert('Failed to update application: ' + err.message);
        }
    };

    return (
        <div className="page">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                        <h3 className="card-title">Rejected Applications</h3>
                        <p className="card-sub">Audit rejected bus pass applications, review rejection remarks, or send them back to the pending queue.</p>
                    </div>
                    <div className="badge" style={{ padding: '8px 16px', borderRadius: '20px', backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 600 }}>
                        {rejectedApps.length} Rejected
                    </div>
                </div>

                <div className="table-wrap mt-4">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>Loading rejected applications...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>STUDENT</th>
                                    <th>REG NO & DEPT</th>
                                    <th>ROUTE</th>
                                    <th>REJECTION DETAILS</th>
                                    <th>RECEIPT & AMOUNT</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rejectedApps.length > 0 ? rejectedApps.map(app => (
                                    <tr key={app.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ 
                                                    width: '40px', height: '50px', borderRadius: '8px', overflow: 'hidden', 
                                                    background: '#f1f5f9', border: '1px solid #e2e8f0', flexShrink: 0 
                                                }}>
                                                    {app.photo_url ? (
                                                        <img src={app.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '18px' }}>👤</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{app.name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{app.email}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{app.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{app.roll_no}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{app.dept}</div>
                                            <span className="badge badge-secondary" style={{ fontSize: '10px', marginTop: '4px', display: 'inline-block' }}>Sem {app.semester}</span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{app.route}</div>
                                        </td>
                                        <td>
                                            <div style={{ 
                                                background: '#fef2f2', 
                                                border: '1px solid #fecaca', 
                                                padding: '8px 12px', 
                                                borderRadius: '8px',
                                                maxWidth: '280px',
                                                marginBottom: '6px'
                                            }}>
                                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#991b1b' }}>Reason:</div>
                                                <div style={{ fontSize: '12px', color: '#7f1d1d', wordBreak: 'break-word', marginTop: '2px', fontStyle: 'italic' }}>
                                                    "{app.remarks}"
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                Rejected by <span style={{ fontWeight: 600 }}>{app.reviewed_by}</span> on {app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', fontWeight: '700' }}>Receipt: <span style={{ color: 'var(--primary)' }}>{app.receipt_no}</span></div>
                                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#059669', marginTop: '2px' }}>Amount: ₹{app.amount}</div>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ 
                                                    padding: '8px 12px', 
                                                    fontSize: '12px', 
                                                    border: '1px solid var(--border)',
                                                    backgroundColor: '#f8fafc',
                                                    color: 'var(--primary)',
                                                    fontWeight: '700'
                                                }} 
                                                onClick={() => handleReconsider(app)}
                                            >
                                                Reconsider
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                            No rejected applications found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RejectedStudents;
