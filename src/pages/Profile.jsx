import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="card" style={{ maxWidth: '600px' }}>
            <h3 className="card-title">User Profile</h3>
            <div className="profile-badge mt-4">
                <div className="avatar-big">{user.name[0]}</div>
                <div className="profile-info">
                    <h4>{user.name}</h4>
                    <p className="text-muted">{user.role.toUpperCase()}</p>
                </div>
            </div>
            
            <div className="grid-2 mt-4">
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="text" className="form-input" value={user.email} readOnly />
                </div>
                <div className="form-group">
                    <label className="form-label">ID / Reg No</label>
                    <input type="text" className="form-input" value={user.id} readOnly />
                </div>
            </div>

            <button className="btn btn-secondary mt-4">Update Password</button>
        </div>
    );
};

export default Profile;
