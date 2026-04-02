import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PlayCircle, PlusSquare, Bell, Settings, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { logout }   from '../../api/auth.api';
import './Sidebar.css';

// Sports categories
const SPORTS = [
    { key:'football', label:'Football', emoji:'⚽' },
    { key:'basketball', label:'Basketball', emoji:'🏀' },
    { key:'tennis', label:'Tennis', emoji:'🎾' },
    { key:'cricket', label:'Cricket', emoji:'🏏' },
    { key:'formula1', label:'Formula 1', emoji:'🏎️' },
    { key:'boxing', label:'Boxing', emoji:'🥊' },
    { key:'swimming', label:'Swimming', emoji:'🏊' },
    { key:'athletics', label:'Athletics', emoji:'🏃' },
];

// Sidebar component
export default function Sidebar() {
    const navigate = useNavigate();
    const { refreshToken, clearAuth } = useAuthStore();

    // Handle user logout
    const handleLogout = async () => {
        try { await logout({ refreshToken }) } catch {}
        clearAuth();
        navigate('/auth');
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-mark">SV</div>
                <span className="logo-text">Sport<span>Vibe</span></span>
            </div>

            <nav className="sidebar-nav">
                <p className="nav-label">Main</p>
                <NavLink to="/home" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><Home size={16}/> Home</NavLink>
                <NavLink to="/reels" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><PlayCircle size={16}/> Reels</NavLink>
                <NavLink to="/create" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><PlusSquare size={16}/> Create</NavLink>

                <p className="nav-label">Sports</p>
                {SPORTS.map(s => (
                    <NavLink key={s.key} to={`/sport/${s.key}`}
                    className={({isActive}) => `sport-item ${isActive ? 'active' : ''}`}>
                    <span>{s.emoji}</span>{s.label}
                    </NavLink>
                ))}

                <p className="nav-label">You</p>
                <NavLink to="/notifications" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><Bell size={16}/> Notifications</NavLink>
                <NavLink to="/settings"      className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}><Settings size={16}/> Settings</NavLink>
            </nav>

            <div className="sidebar-bottom">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={16}/> Logout
                </button>
            </div>
        </aside>
    );
}