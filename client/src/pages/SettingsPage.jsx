import { useState } from 'react';
import { updateProfile } from '../api/users.api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import './SettingsPage.css';

// Setting page component
export default function SettingsPage() {
    const { user, setAuth } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        location: user?.location || '',
        sport: user?.sport || '',
    });

    // Handle form input changes
    const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    // Handle saving profile changes
    const handleSave = async () => {
        try {
            const { data } = await updateProfile(form);
            setAuth({ user: data.data.user });
            toast.success('Profile updated!');
            setEditing(false);
        } catch { toast.error('Update failed'); }
    }

    // Render the settings page
    return (
        <div className="settings-page">
            <h2>Settings</h2>
            <p className="settings-subtitle">Manage your profile and preferences</p>

            <div className="settings-profile-card">
                <div className="settings-avatar">{user?.name?.[0] || 'U'}</div>
                <div className="settings-profile-info">
                    <h3>{user?.name}</h3>
                    <p>@{user?.username} · {user?.location}</p>
                </div>
                <button className="edit-profile-btn" onClick={() => setEditing(p => !p)}> {editing ? 'Cancel' : 'Edit Profile'} </button>
            </div>

            {editing && (
                <div className="settings-edit-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input name="name" value={form.name} onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>Bio</label>
                        <textarea name="bio" value={form.bio} onChange={onChange} rows={3} />
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input name="location" value={form.location} onChange={onChange} />
                    </div>
                    <div className="settings-form-actions">
                        <button className="settings-save-btn" onClick={handleSave}>Save Changes</button>
                    </div>
                </div>
            )}

            <div className="settings-section">
                <div className="settings-section-title">Account</div>
                <div className="settings-row" onClick={() => toast.success('Coming soon!')}>
                    <span>Change Password</span>
                    <span className="settings-arrow">›</span>
                </div>
                <div className="settings-row" onClick={() => toast.success('Coming soon!')}>
                    <span>Email Address</span>
                    <span className="settings-arrow">›</span>
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-section-title danger">Danger Zone</div>
                <div className="settings-row danger-row" onClick={() => toast.error('Contact support to delete account')}>
                    <span>Delete Account</span>
                    <span className="settings-arrow">›</span>
                </div>
            </div>

        </div>
    );
}