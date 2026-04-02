import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';
import api from '../api/axios'
import { Play, Grid, Heart, Users, Video } from 'lucide-react';
import './ProfilePage.css';

// Map Sports emojis
const SPORT_EMOJI = {
    football:'⚽', 
    cricket:'🏏', 
    basketball:'🏀', 
    tennis:'🎾',
    formula1:'🏎️', 
    boxing:'🥊', 
    swimming:'🏊', 
    athletics:'🏃', 
    general:'🎥'
}

// Auto-generate thumbnail from video using canvas
function VideoThumb({ reel, onClick }) {
    const videoRef  = useRef(null);
    const canvasRef = useRef(null);
    const [thumb, setThumb] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const emoji = SPORT_EMOJI[reel.sport] || '🎥';

    // Capture thumbnail
    const captureThumb = () => {
        const video  = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width  = video.videoWidth  || 320;
        canvas.height = video.videoHeight || 180;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        setThumb(canvas.toDataURL('image/jpeg', 0.7));
        setLoaded(true);
        video.src = '';
    }

    // Render thumbnail card
    return (
        <div className="prof-media-card" onClick={() => onClick(reel)}>
            {!loaded && reel.videoUrl && (
                <>
                    <video 
                    ref={videoRef}
                    src={reel.videoUrl}
                    mutedplaysInlinepreload="metadata"
                    style={{ display:'none' }}
                    onLoadedData={captureThumb}
                    onError={() => setLoaded(true)} />
                    <canvas ref={canvasRef} style={{ display:'none' }} />
                </>
            )}

            {thumb ? <img src={thumb} alt={reel.title} className="prof-media-thumb" />
            : <div className="prof-media-emoji">
                <span>{emoji}</span>
            </div>
            }

            <div className="prof-media-overlay">
                <Play size={20} fill="white" color="white" />
                <div className="prof-media-stats">
                    <span>❤️ {reel.likesCount ?? reel.likes?.length ?? 0}</span>
                    <span>👁 {reel.views ?? 0}</span>
                </div>
            </div>

            <div className="prof-media-badge">{emoji}</div>
        </div>
    );  
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);
    const [activeTab, setActiveTab] = useState('reels');

    // Fetch user's reels
    const { data, isLoading } = useQuery({
        queryKey: ['my-reels', user?._id],
        queryFn: () => api.get(`/users/${user._id}`),
        enabled: !!user?._id,
    });

    // Use profile data from query if available
    const profile  = data?.data?.data?.user  || user;
    const reels = data?.data?.data?.reels || [];

    // Handle reel click
    const handleReelClick = (reel) => {
        navigate('/reels');
    }

    const initials = profile?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    return (
        <div className="prof-page">
            
            <div className="prof-banner">
                <div className="prof-banner-bg"/>

                {/* ── Profile Header ── */}
                <div className="prof-header-content">

                    <div className="prof-avatar-wrap">
                        <div className="prof-avatar">
                        {profile?.avatar ? <img src={profile.avatar} alt={profile.name} /> : <span>{initials}</span>}
                        </div>
                    </div>

                    <div className="prof-identity">
                        <h1 className="prof-name">{profile?.name}</h1>
                        <p className="prof-username">@{profile?.username}</p>
                        {profile?.location && ( <p className="prof-location">📍{profile.location}</p> )}
                        {profile?.bio && ( <p className="prof-bio">{profile.bio}</p> )}
                        {profile?.sport && ( <span className="prof-sport-tag"> {SPORT_EMOJI[profile.sport]} {profile.sport} </span> )}
                    </div>

                    <div className="prof-stats">
                        <div className="prof-stat">
                            <span className="prof-stat-val"> {reels.length || profile?.reelsCount || 0} </span>
                            <span className="prof-stat-lbl">Reels</span>
                        </div>
                        <div className="prof-stat-divider" />
                        <div className="prof-stat">
                            <span className="prof-stat-val"> {profile?.followersCount ?? profile?.followers?.length ?? 0} </span>
                            <span className="prof-stat-lbl">Followers</span>
                        </div>
                        <div className="prof-stat-divider" />
                        <div className="prof-stat">
                            <span className="prof-stat-val"> {profile?.followingCount ?? profile?.following?.length ?? 0} </span>
                            <span className="prof-stat-lbl">Following</span>
                        </div>
                        <div className="prof-stat-divider" />
                        <div className="prof-stat">
                            <span className="prof-stat-val"> {reels.reduce((a, r) => a + (r.views || 0), 0).toLocaleString()} </span>
                            <span className="prof-stat-lbl">Views</span>
                        </div>
                    </div>

                    <div className="prof-actions">
                        <button className="prof-edit-btn" onClick={() => navigate('/settings')}>Edit Profile</button>
                        <button className="prof-share-btn" onClick={() => {
                            navigator.clipboard?.writeText(window.location.href)
                            alert('Profile link copied!')
                        }}> Share </button>
                    </div>

                </div>

            </div>

            <div className="prof-tabs">
                <button className={`prof-tab ${activeTab === 'reels' ? 'active' : ''}`} onClick={() => setActiveTab('reels')}>
                    <Grid size={16} /> Reels
                </button>
                <button className={`prof-tab ${activeTab === 'liked' ? 'active' : ''}`} onClick={() => setActiveTab('liked')}>
                    <Heart size={16} /> Liked
                </button>
            </div>

            <div className="prof-media-section">
                {isLoading && (
                    <div className="prof-loading">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="prof-skeleton" />
                        ))}
                    </div>
                )}

                {!isLoading && activeTab === 'reels' && (
                    <>
                        {reels.length === 0
                        ? <div className="prof-empty">
                            <Video size={48} strokeWidth={1} />
                            <p>No reels yet</p>
                            <button className="prof-upload-btn" onClick={() => navigate('/create')} > Upload your first reel </button>
                        </div>
                        : <div className="prof-media-grid">
                            {reels.map(reel => (
                                <VideoThumb key={reel._id} reel={reel} onClick={handleReelClick} />
                            ))}
                        </div>}
                    </>
                )}

                {!isLoading && activeTab === 'liked' && (
                    <div className="prof-empty">
                        <Heart size={48} strokeWidth={1} />
                        <p>Liked reels coming soon</p>
                    </div>
                )}

            </div>

        </div>
    );
}