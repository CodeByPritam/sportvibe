import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { followUser } from '../api/users.api';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './SearchPage.css';

// SearchPage component
export default function SearchPage() {
    const [params] = useSearchParams();
    const q = params.get('q') || '';

    // Search results using React Query
    const { data, isLoading } = useQuery({
        queryKey: ['search', q],
        queryFn: () => api.get(`/search?q=${encodeURIComponent(q)}`),
        enabled: q.length > 1,
    });

    const users = data?.data?.data?.users || [];
    const reels = data?.data?.data?.reels || [];

    // Follow user handler
    const handleFollow = async (id, name) => {
        try {
            await followUser(id);
            toast.success(`Following ${name}!`);
        } catch { toast.error('Failed'); }
    }

    // Render search results
    return (
        <div className="search-page">
            
            <h2>Results for "{q}"</h2>
            <p className="search-meta">{users.length} people · {reels.length} reels</p>

            {isLoading && <p className="loading-text">Searching…</p>}

            {users.length > 0 && <>
                <h3 className="search-section-title">People</h3>
                <div className="search-people-grid">
                    {users.map(u => (
                        <div key={u._id} className="search-card">
                            <div className="search-card-avatar">{u.name?.[0]}</div>
                            <div className="search-card-name">{u.name}</div>
                            <div className="search-card-username">@{u.username}</div>
                            <div className="search-card-loc">📍 {u.location}</div>
                            <p className="search-card-bio">{u.bio}</p>
                            <button className="search-follow-btn" onClick={() => handleFollow(u._id, u.name)}>Follow +</button>
                        </div>
                    ))}
                </div>
            </>}

            {reels.length > 0 && <>
                <h3 className="search-section-title">Reels</h3>
                <div className="search-reels-grid">
                    {reels.map(r => (
                        <div key={r._id} className="search-reel-thumb">
                            <span className="search-reel-emoji">
                                {r.sport === 'football' ? '⚽' : r.sport === 'cricket' ? '🏏' : r.sport === 'basketball' ? '🏀' : '🎥'}
                            </span>
                            <div className="search-reel-info">
                                <div className="search-reel-title">{r.title}</div>
                                <div className="search-reel-views">▶ {r.views?.toLocaleString()} views</div>
                            </div>
                        </div>
                    ))}
                </div>
            </>}

    </div>
    );
    
}