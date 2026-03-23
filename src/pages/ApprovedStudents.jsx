import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const ApprovedStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApprovedStudents();
    }, []);

    const fetchApprovedStudents = async () => {
        setLoading(true);
        try {
            // Join with users for semester and routes for route name
            const { data, error } = await supabase
                .from('passes')
                .select(`
                    *,
                    users (semester, email, phone),
                    routes (name)
                `)
                .order('issued_at', { ascending: false });

            if (error) throw error;

            const formatted = data.map(p => ({
                id: p.id,
                name: p.student_name,
                email: p.users?.email || 'N/A',
                roll_no: p.roll_no,
                dept: p.dept,
                semester: p.users?.semester || 'N/A',
                route: p.routes?.name || p.route_id,
                issued_at: p.issued_at,
                valid_to: p.valid_to,
                photo_url: p.photo_url
            }));

            setStudents(formatted);
        } catch (err) {
            console.error('Fetch approved students error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                        <h3 className="card-title">Approved Students</h3>
                        <p className="card-sub">List of students with active or issued digital bus passes.</p>
                    </div>
                    <div className="badge badge-success" style={{ padding: '8px 16px', borderRadius: '20px' }}>
                        {students.length} Total Passes
                    </div>
                </div>

                <div className="table-wrap mt-4">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>Loading approved students...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>STUDENT</th>
                                    <th>REG NO & DEPT</th>
                                    <th>SEMESTER</th>
                                    <th>ROUTE</th>
                                    <th>VALID UNTIL</th>
                                    <th>PASS ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? students.map(s => (
                                    <tr key={s.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ 
                                                    width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', 
                                                    background: '#f1f5f9', border: '1px solid #e2e8f0', flexShrink: 0 
                                                }}>
                                                    {s.photo_url ? (
                                                        <img src={s.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '20px' }}>👤</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{s.name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{s.roll_no}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.dept}</div>
                                        </td>
                                        <td>
                                            <span className="badge badge-secondary" style={{ fontSize: '11px' }}>{s.semester} Sem</span>
                                        </td>
                                        <td>
                                            <div style={{ maxWidth: '180px', fontSize: '13px', fontWeight: 600 }}>{s.route}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: '#059669' }}>{new Date(s.valid_to).toLocaleDateString()}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#6366f1', letterSpacing: '0.5px' }}>{s.id}</div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                            No approved students found.
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

export default ApprovedStudents;
