import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const Settings = () => {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        id: user.id || '',
        name: user.name || '',
        email: user.email || '',
        roll_no: user.roll_no || '',
        dept: user.dept || '',
        semester: user.semester || '',
        phone: user.phone || ''
    });
    const [isEditingFields, setIsEditingFields] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('photos')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            login({ ...user, avatar: publicUrl });
            setMessage({ type: 'success', text: 'Profile photo updated!' });
        } catch (err) {
            console.error('Photo upload error:', err);
            setMessage({ type: 'danger', text: 'Photo upload failed: ' + err.message });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isEditingFields) {
            setIsEditingFields(true);
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase
                .from('users')
                .update(formData)
                .eq('id', user.id);

            if (error) throw error;

            login({ ...user, ...formData });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditingFields(false);
        } catch (err) {
            console.error('Update profile error:', err);
            setMessage({ type: 'danger', text: 'Update failed: ' + err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <div style={{ 
                            width: '120px', height: '120px', borderRadius: '50%', 
                            background: 'var(--bg-gradient)', border: '4px solid white', 
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {user.avatar ? (
                                <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '48px', color: 'white', fontWeight: '800' }}>{user.name?.charAt(0)}</span>
                            )}
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading || !isEditingFields}
                            style={{ 
                                position: 'absolute', bottom: '0', right: '0', 
                                padding: '8px', borderRadius: '50%', width: '36px', height: '36px',
                                border: '2px solid white',
                                opacity: isEditingFields ? 1 : 0.5,
                                cursor: isEditingFields ? 'pointer' : 'not-allowed'
                            }}
                        >
                            📷
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handlePhotoUpload} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                        />
                    </div>
                    <h2 style={{ marginTop: '20px', fontSize: '24px', fontWeight: '800' }}>{formData.name}</h2>
                    <p className="card-sub">{user.role?.toUpperCase()} ACCOUNT</p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`} style={{ marginBottom: '20px' }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                className="form-input" 
                                value={formData.name}
                                onChange={handleChange}
                                required 
                                disabled={!isEditingFields}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                className="form-input" 
                                value={formData.email}
                                onChange={handleChange}
                                required 
                                disabled={!isEditingFields}
                            />
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">{user.role === 'admin' ? 'Designation' : 'Registration Number'}</label>
                            <input 
                                type="text" 
                                name="roll_no" 
                                className="form-input" 
                                value={formData.roll_no}
                                onChange={handleChange}
                                placeholder={user.role === 'admin' ? "e.g. System Administrator" : "Student Registration Number"}
                                disabled={!isEditingFields}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mobile Number</label>
                            <input 
                                type="text" 
                                name="phone" 
                                className="form-input" 
                                value={formData.phone}
                                onChange={handleChange}
                                required 
                                disabled={!isEditingFields}
                            />
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <input 
                                type="text" 
                                name="dept" 
                                className="form-input" 
                                value={formData.dept}
                                onChange={handleChange}
                                placeholder={user.role === 'admin' ? "e.g. Administration" : "e.g. Computer Science"}
                                disabled={!isEditingFields}
                            />
                        </div>
                        {user.role === 'student' && (
                            <div className="form-group">
                                <label className="form-label">Semester</label>
                                <input 
                                    type="text" 
                                    name="semester" 
                                    className="form-input" 
                                    value={formData.semester}
                                    onChange={handleChange}
                                    disabled={!isEditingFields}
                                />
                            </div>
                        )}
                    </div>

                    <div className="separator" style={{ margin: '30px 0' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        {isEditingFields && (
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => setIsEditingFields(false)}
                                style={{ padding: '12px 30px' }}
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            type="submit" 
                            className={`btn ${isEditingFields ? 'btn-success' : 'btn-primary'}`} 
                            disabled={loading || uploading}
                            style={{ padding: '12px 30px', minWidth: '150px' }}
                        >
                            {loading ? 'Saving...' : isEditingFields ? 'Save Changes' : 'Edit Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
