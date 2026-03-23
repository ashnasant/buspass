import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Topbar = ({ onMenuClick }) => {
    const { user } = useAuth();
    const [notifCount, setNotifCount] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [showAnnounceForm, setShowAnnounceForm] = useState(false);
    const [newAnnounce, setNewAnnounce] = useState({ title: '', content: '' });
    
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifs();
        fetchAnnouncements();

        // Real-time subscription for notifications
        const notifSub = supabase
            .channel('notifications_changes')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'notifications',
                filter: `user_id=eq.${user?.id}`
            }, () => fetchNotifs())
            .subscribe();

        // Real-time subscription for announcements
        const announceSub = supabase
            .channel('announcements_changes')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'announcements'
            }, () => fetchAnnouncements())
            .subscribe();

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            supabase.removeChannel(notifSub);
            supabase.removeChannel(announceSub);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [user?.id]);

    const fetchNotifs = async () => {
        if (!user?.id) return;
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (!error) {
            setNotifications(data || []);
            setNotifCount(data.filter(n => !n.is_read).length);
        }
    };

    const fetchAnnouncements = async () => {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error) setAnnouncements(data || []);
    };

    const handleMarkAsRead = async (id) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        fetchNotifs();
    };

    const handleAddAnnouncement = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('announcements').insert([{
                ...newAnnounce,
                admin_id: user.id
            }]);
            if (error) throw error;
            
            setNewAnnounce({ title: '', content: '' });
            setShowAnnounceForm(false);
            fetchAnnouncements();
        } catch (err) {
            console.error('Announcement post error:', err);
            alert(`Failed to post announcement: ${err.message || 'Unknown error'}`);
        }
    };

    return (
        <div className="topbar">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button className="menu-btn" onClick={onMenuClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="topbar-title">BusID<span style={{ color: 'var(--primary)' }}></span></div>
            </div>
            
            <div className="topbar-actions" ref={dropdownRef}>
                {/* NOTIFICATION BELL */}
                <div 
                    className="icon-btn" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ 
                        position: 'relative', border: '1px solid var(--border)', background: 'white',
                        padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                    }}
                >
                    <span style={{ fontSize: '18px' }}>🔔</span>
                    {notifCount > 0 && <div className="notif-dot" style={{ 
                        position: 'absolute', top: '8px', right: '8px', 
                        width: '10px', height: '10px', background: 'var(--danger)', 
                        borderRadius: '50%', border: '2px solid white'
                    }}></div>}
                </div>

                {/* NOTIFICATION DROPDOWN */}
                {isDropdownOpen && (
                    <div style={{ 
                        position: 'absolute', top: '70px', right: '0', width: 'min(380px, 90vw)', 
                        maxHeight: '520px', overflowY: 'auto', zIndex: 1000, 
                        borderRadius: '16px', padding: '0', background: 'white',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)', border: '1px solid var(--border)'
                    }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, fontWeight: 800 }}>Center</h4>
                            {user?.role === 'admin' && (
                                <button 
                                    className="btn btn-primary" 
                                    style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '8px' }}
                                    onClick={() => setShowAnnounceForm(!showAnnounceForm)}
                                >
                                    {showAnnounceForm ? 'Close' : '+ Announce'}
                                </button>
                            )}
                        </div>

                        {showAnnounceForm && user?.role === 'admin' && (
                            <form onSubmit={handleAddAnnouncement} style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                <input 
                                    type="text" 
                                    placeholder="Announcement Title" 
                                    className="form-input" 
                                    style={{ marginBottom: '10px', padding: '8px' }} 
                                    value={newAnnounce.title}
                                    onChange={e => setNewAnnounce({...newAnnounce, title: e.target.value})}
                                    required
                                />
                                <textarea 
                                    placeholder="Details..." 
                                    className="form-input" 
                                    style={{ marginBottom: '10px', padding: '8px', minHeight: '60px' }}
                                    value={newAnnounce.content}
                                    onChange={e => setNewAnnounce({...newAnnounce, content: e.target.value})}
                                    required
                                />
                                <button type="submit" className="btn btn-primary w-full" style={{ padding: '8px' }}>Post Global Announcement</button>
                            </form>
                        )}

                        <div className="notif-list">
                            {/* Announcements First */}
                            {announcements.map(ann => (
                                <div key={ann.id} style={{ padding: '16px 20px', background: '#f0f9ff', borderBottom: '1px solid #e0f2fe' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                        <div style={{ background: 'var(--primary)', color: 'white', padding: '4px', borderRadius: '6px', fontSize: '12px' }}>📢</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{ann.title}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{ann.content}</div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>ANNOUNCEMENT • {new Date(ann.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* User Notifications */}
                            {notifications.length > 0 ? notifications.map(notif => (
                                <div 
                                    key={notif.id} 
                                    onClick={() => handleMarkAsRead(notif.id)}
                                    style={{ 
                                        padding: '16px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                                        background: notif.is_read ? 'white' : '#f5f3ff'
                                    }}
                                >
                                    <div style={{ fontWeight: 700, fontSize: '14px', color: notif.is_read ? '#64748b' : '#1e293b' }}>{notif.message}</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px' }}>{new Date(notif.created_at).toLocaleString()}</div>
                                </div>
                            )) : announcements.length === 0 && (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎐</div>
                                    <div style={{ fontSize: '13px' }}>All caught up!</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* USER PROFILE BUTTON */}
                <Link to="/settings" className="user-profile-sm" style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none',
                    padding: '6px 16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid var(--border)',
                    transition: 'all 0.2s ease'
                }}>
                    <div style={{ 
                        width: '36px', height: '36px', background: 'var(--bg-gradient)', 
                        borderRadius: '10px', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '14px',
                        overflow: 'hidden', flexShrink: 0
                    }}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            user?.name?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div style={{ display: 'none' }} className="user-details-desktop">
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{user?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{user?.role}</div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Topbar;
