import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import './Topbar.css';

// Export topbar
export default function Topbar() {
    const [q, setQ] = useState('');
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);

    // Handle search input change
    const handleChange = useCallback((e) => {
        const val = e.target.value;
        setQ(val);
        if (val.trim().length > 1) { navigate(`/search?q=${encodeURIComponent(val.trim())}`); }
    }, [navigate]);

    // Render topbar
    return (
        <header className="topbar">
            <div className="search-wrap">
                <Search size={13} className="search-icon" />
                <input className="search-input" placeholder="Search athletes, sports, reels…" value={q} onChange={handleChange} />
            </div>
            <div className="topbar-avatar" onClick={() => navigate('/settings')}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
        </header>
    );
}