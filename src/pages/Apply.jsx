import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const Apply = () => {
    const { user } = useAuth();
    const [routes, setRoutes] = useState([]);
    const [status, setStatus] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [formData, setFormData] = useState({
        route_id: '',
        receipt_no: '',
        semester: '5'
    });

    const [hasActivePass, setHasActivePass] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const { data: routesData } = await supabase.from('routes').select('*');
                setRoutes(routesData || []);

                const { data: passesData } = await supabase
                    .from('passes')
                    .select('*')
                    .eq('student_id', user.id)
                    .eq('status', 'active');
                setHasActivePass(passesData && passesData.length > 0);

                const { data: appsData } = await supabase
                    .from('applications')
                    .select('*')
                    .eq('student_id', user.id)
                    .eq('status', 'pending');
                setIsPending(appsData && appsData.length > 0);
            } catch (err) {
                console.error('Status check failed:', err);
            }
        };
        if (user?.id) checkStatus();
    }, [user?.id]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Submitting...');
        const selectedRoute = routes.find(r => r.id === formData.route_id);
        const appId = 'APP' + Math.random().toString(36).substr(2, 6).toUpperCase();
        let photo_url = null;

        try {
            // 1. Upload Photo to Supabase Storage
            if (photo) {
                const fileExt = photo.name.split('.').pop();
                const fileName = `${appId}-${Date.now()}.${fileExt}`;
                const filePath = `applications/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('applications')
                    .upload(filePath, photo);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('applications')
                    .getPublicUrl(filePath);
                
                photo_url = urlData.publicUrl;
            }

            // 2. Insert Application Data
            const { error: insertError } = await supabase
                .from('applications')
                .insert([{
                    id: appId,
                    student_id: user.id,
                    student_name: user.name,
                    roll_no: user.roll_no || 'NOT_SET',
                    dept: user.dept || 'NOT_SET',
                    route_id: formData.route_id,
                    receipt_no: formData.receipt_no,
                    amount: selectedRoute ? selectedRoute.fare : 0,
                    semester: formData.semester,
                    phone: user.phone || '0000000000',
                    photo_url: photo_url,
                    status: 'pending'
                }]);

            if (insertError) throw insertError;

            setSubmitted(true);
            setStatus('Application submitted successfully!');
            setIsPending(true);
        } catch (err) {
            console.error('Submission error:', err);
            setStatus('Failed to submit application: ' + err.message);
        }
    };

    if (submitted) {
        return (
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="card" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>Application Success!</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.6' }}>
                        Your bus pass application has been submitted and is now under review by the administration. 
                        You will be notified once it is approved.
                    </p>
                    <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '30px', padding: '12px 30px' }}>
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '32px' }}>📝</div>
                    <div>
                        <h3 className="card-title">Apply for Bus Pass</h3>
                        <p className="card-sub">Choose your route and provide payment details.</p>
                    </div>
                </div>
                
                {status && <div className={`alert ${status.includes('success') ? 'alert-success' : 'alert-danger'}`}>{status}</div>}
                
                {(hasActivePass || isPending) && (
                    <div className="alert alert-warning" style={{ background: '#fff9db', color: '#856404', border: '1px solid #ffeeba' }}>
                        {hasActivePass 
                            ? "You already have an active bus pass. Duplicate applications are not allowed for the same semester." 
                            : "Your bus pass application is currently under review. Please wait for admin approval."}
                    </div>
                )}

                <form className="mt-4" onSubmit={handleSubmit} style={{ opacity: (hasActivePass || isPending) ? 0.6 : 1, pointerEvents: (hasActivePass || isPending) ? 'none' : 'auto' }}>
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'flex-start' }}>
                        <div style={{ flex: '0 0 150px' }}>
                            <label className="form-label">Profile Photo</label>
                            <div 
                                onClick={() => document.getElementById('photo-upload').click()}
                                style={{ 
                                    width: '150px', height: '180px', border: '2px dashed var(--border)', 
                                    borderRadius: '12px', display: 'flex', alignItems: 'center', 
                                    justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
                                    background: '#f8fafc', position: 'relative'
                                }}
                            >
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '24px' }}>📷</div>
                                        <div style={{ fontSize: '12px', marginTop: '4px' }}>Upload Photo</div>
                                    </div>
                                )}
                                <input id="photo-upload" type="file" hidden accept="image/*" onChange={handlePhotoChange} required />
                            </div>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                            <div className="form-group">
                                <label className="form-label">Select Preferred Route</label>
                                <select className="form-input" style={{ height: '50px' }} onChange={e => setFormData({...formData, route_id: e.target.value})} required>
                                    <option value="">-- Choose a Route --</option>
                                    {routes.map(r => (
                                        <option key={r.id} value={r.id}>{r.name} - ₹{r.fare}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Academic Semester</label>
                                    <input type="text" className="form-input" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '800', fontSize: '1.1em', color: 'var(--primary)' }}>
                                        Fee Receipt Number
                                    </label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        style={{ border: '2px solid var(--primary)', fontSize: '1.2em', fontWeight: 'bold' }}
                                        placeholder="e.g. REC-2024-XXXX" 
                                        onChange={e => setFormData({...formData, receipt_no: e.target.value})} 
                                        required 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="alert alert-success" style={{ backgroundColor: '#e7f1ff', color: '#0056b3', border: '1px dashed #0056b3' }}>
                        <strong>Note:</strong> Please ensure the receipt number and photo are clear for faster approval.
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ padding: '16px' }}>Submit Pass Application</button>
                </form>
            </div>
        </div>
    );
};

export default Apply;
