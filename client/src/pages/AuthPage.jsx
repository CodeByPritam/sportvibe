import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth.api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import './AuthPage.css';

// AuthPage component
export default function AuthPage() {
    const [tab, setTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name:'', username:'', email:'', password:'' });
    const navigate = useNavigate();
    const setAuth = useAuthStore(s => s.setAuth);

    // Handle input changes
    const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    // Handle form submission
    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const fn   = tab === 'login' ? login : register;
            const body = tab === 'login' ? { email: form.email, password: form.password }: form;
            const { data } = await fn(body);
            setAuth(data.data);
            toast.success(tab === 'login' ? 'Welcome back!' : 'Account created!');
            navigate('/home');
        } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); } 
        finally { setLoading(false) }
    }

    // Render the authentication form
    return (
        <div className="auth-screen">
            <div className="auth-card">

                <div className="auth-logo">
                    <div className="auth-logo-icon">SV</div>
                    <h1>Sport<span>Vibe</span></h1>
                </div>

                <div className="auth-tabs">
                    <button className={`auth-tab ${tab==='login'  ? 'active':''}`} onClick={() => setTab('login')}>Login</button>
                    <button className={`auth-tab ${tab==='signup' ? 'active':''}`} onClick={() => setTab('signup')}>Sign Up</button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {tab === 'signup' && <>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input name="name" placeholder="Lionel Messi" onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <label>Username</label>
                            <input name="username" placeholder="@messi10" onChange={onChange} required />
                        </div>
                    </>}
                    <div className="form-group">
                        <label>Email</label>
                        <input name="email" type="email" placeholder="you@sportvibe.com" onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input name="password" type="password" placeholder="••••••••" onChange={onChange} required />
                    </div>
                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Please wait…' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
                    </button>
                </form>

            </div>
        </div>
    );
}