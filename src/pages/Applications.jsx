import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const Applications = () => {
    const { user } = useAuth();
    const [apps, setApps] = useState([]);
    const [remarks, setRemarks] = useState({});

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        const { data, error } = await supabase
            .from('applications')
            .select(`
                *,
                routes (
                    name
                )
            `)
            .eq('status', 'pending')
            .order('applied_at', { ascending: false });

        if (error) {
            console.error('Fetch apps error:', error);
            return;
        }

        // Flatten route name
        const formattedData = data.map(app => ({
            ...app,
            route_name: app.routes ? app.routes.name : 'Unknown'
        }));
        setApps(formattedData);
    };

    const handleAction = async (id, status) => {
        try {
            const currentRemarks = remarks[id] || '';
            const { error: updateError } = await supabase
                .from('applications')
                .update({
                    status,
                    remarks: currentRemarks,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: user.name
                })
                .eq('id', id);

            if (updateError) throw updateError;

            // If approved, create a pass and notify user
            if (status === 'approved') {
                const app = apps.find(a => a.id === id);
                const passId = 'PASS' + Math.random().toString(36).substr(2, 8).toUpperCase();
                
                const validTo = new Date();
                validTo.setMonth(validTo.getMonth() + 6);

                const { error: passError } = await supabase
                    .from('passes')
                    .insert([{
                        id: passId,
                        app_id: id,
                        student_id: app.student_id,
                        student_name: app.student_name,
                        roll_no: app.roll_no,
                        dept: app.dept,
                        route_id: app.route_id,
                        valid_from: new Date().toISOString().split('T')[0],
                        valid_to: validTo.toISOString().split('T')[0],
                        photo_url: app.photo_url
                    }]);

                if (passError) throw passError;

                await supabase.from('notifications').insert([{
                    user_id: app.student_id,
                    title: 'Pass Approved!',
                    message: `Your bus pass (${passId}) has been issued. View it in 'My Pass'.`,
                    type: 'success'
                }]);
            } else if (status === 'rejected') {
                const app = apps.find(a => a.id === id);
                await supabase.from('notifications').insert([{
                    user_id: app.student_id,
                    title: 'Application Rejected',
                    message: `Reason: ${currentRemarks}`,
                    type: 'danger'
                }]);
            }

            alert(`Application ${status} successfully!`);
            fetchApps();
        } catch (err) {
            console.error('Action error:', err);
            alert('Failed to update application: ' + err.message);
        }
    };

    return (
        <div className="page">
            <div className="card">
                <h3 className="card-title">Manage Pass Applications</h3>
                <p className="card-sub">Review and verify student payment receipts to issue passes.</p>
                
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Student & Receipt</th>
                                <th>Reg No / Dept</th>
                                <th>Route</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apps.map(app => (
                                <tr key={app.id}>
                                    <td>
                                        <div style={{ 
                                            width: '50px', height: '60px', background: '#f1f5f9', 
                                            borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0'
                                        }}>
                                            {app.photo_url ? (
                                                <img 
                                                    src={app.photo_url} 
                                                    alt="Student" 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onClick={() => window.open(app.photo_url, '_blank')}
                                                />
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '20px' }}>👤</div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{app.student_name}</div>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{app.id}</div>
                                        
                                        <div style={{ 
                                            background: '#f0f9ff', 
                                            border: '1px solid #bae6fd', 
                                            padding: '6px 10px', 
                                            borderRadius: '8px',
                                            display: 'inline-block'
                                        }}>
                                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#0369a1' }}>
                                                Receipt: <span style={{ fontSize: '15px', color: '#0284c7' }}>{app.receipt_no}</span>
                                            </div>
                                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#0ea5e9', marginTop: '2px' }}>
                                                Amount Paid: ₹{app.amount}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{app.roll_no}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{app.dept} (Sem {app.semester})</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{app.route_name}</div>
                                    </td>
                                    <td>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            style={{ padding: '6px', fontSize: '12px', minWidth: '150px' }}
                                            placeholder="Add remarks..."
                                            value={remarks[app.id] || ''}
                                            onChange={e => setRemarks({...remarks, [app.id]: e.target.value})}
                                        />
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-primary" style={{ padding: '6px 12px' }} onClick={() => handleAction(app.id, 'approved')}>Approve</button>
                                            <button className="btn btn-secondary" style={{ padding: '6px 12px', color: '#dc3545' }} onClick={() => handleAction(app.id, 'rejected')}>Reject</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {apps.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center">No pending applications found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Applications;
