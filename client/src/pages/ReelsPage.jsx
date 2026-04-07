import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getScroll } from '../api/reels.api';
import { likeReel } from '../api/reels.api';
import { Heart, MessageCircle, Share2, ChevronUp, ChevronDown, Play, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import './ReelsPage.css';

// Emoji maping
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

// Single reel item component
function ReelItem({ reel, isActive }) {
    const [liked, setLiked] = useState(reel.isLiked);
    const [count, setCount] = useState(reel.likesCount);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted]  = useState(false);
    const videoRef = useRef(null);
    const itemRef  = useRef(null)
    const emoji = SPORT_EMOJI[reel.sport] || '🎥';
    const navigate = useNavigate()

   // Auto-play
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isActive) {
            const playVideo = () => {
                video.muted = false;
                video.play().then(() => setPlaying(true)).catch(err => {
                        console.log('Unmuted autoplay blocked, retrying muted');
                        video.muted = true;
                        setMuted(true);
                        video.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
                });
            }

            if (video.readyState >= 3) {
                playVideo()
            } else {
                video.addEventListener('canplay', playVideo, { once: true })
                return () => video.removeEventListener('canplay', playVideo)
            }
        } else {
            video.pause();
            video.currentTime = 0;
            setPlaying(false);
        }
        }, [isActive])

    // Toggle play/pause on click
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (playing) {
            videoRef.current.pause();
            setPlaying(false);
        } else {
            videoRef.current.play();
            setPlaying(true);
        }
    }

    // Toggle mute/unmute
    const toggleMute = e => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !muted;
            setMuted(p => !p);
        }
    }

    // Handle like/unlike
    const handleLike = async (e) => {
        e.stopPropagation();
        setLiked(p => !p);
        setCount(p => liked ? p - 1 : p + 1);
        try { 
            await likeReel(reel._id); 
        } catch { 
            setLiked(p => !p); setCount(p => liked ? p + 1 : p - 1); 
        }
    }

    // Handle share (copy link)
    const handleShare = (e) => {
        e.stopPropagation();
        const url = `${window.location.origin}/reels/${reel._id}`;
        navigator.clipboard?.writeText(url);
        toast.success('Reel link copied!');
    }

    // Render reel item
    return (
        <div className="reel-item" ref={itemRef} data-id={reel._id}>

            <div className="reel-bg" onClick={togglePlay}>
            {reel.videoUrl ? <video ref={videoRef} src={reel.videoUrl} loop muted playsInline className="reel-video" />
                : <div className="reel-emoji-bg">
                    <span style={{ fontSize:'120px', opacity:.25 }}>{emoji}</span>
                </div>
            }

            <div className="reel-overlay" />
                {!playing && (
                    <div className="reel-play-indicator">
                        <Play size={40} fill="white" color="white" />
                    </div>
                )}
            </div>

            <button className="reel-mute-btn" onClick={toggleMute}>
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <div className="reel-header">
                <div className="reel-user-avatar"> {reel.user?.name?.[0] || 'U'} </div>
                <div className="reel-user-info">
                    <span className="reel-uname">{reel.user?.name}</span>
                    <span className="reel-loc">📍 {reel.user?.location}</span>
                    {reel.user?.bio && <span className="reel-bio">{reel.user.bio}</span>}
                </div>
                <button className="reel-follow-btn" onClick={() => toast.success(`Following ${reel.user?.name}!`)}> Follow + </button>
            </div>

            <div className="reel-footer">
                <div className="reel-caption">
                    <p className="reel-title">{reel.title}</p>
                    <p className="reel-desc">{reel.caption}</p>
                    {reel.tags?.length > 0 && (
                        <p className="reel-tags"> {reel.tags.map(t => `#${t}`).join(' ')} </p>
                    )}
                </div>

                <div className="reel-actions">
                    <button className={`reel-action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
                        <Heart size={26} fill={liked ? 'currentColor' : 'none'} />
                        <span>{count}</span>
                    </button>
                    <button className="reel-action-btn" onClick={() => toast.success('Comments coming soon!')}>
                        <MessageCircle size={26} />
                        <span>{reel.commentsCount}</span>
                    </button>
                    <button className="reel-action-btn" onClick={handleShare}>
                        <Share2 size={26} />
                        <span>Share</span>
                    </button>
                </div>
            </div>

        </div>
    );
}

// Export  ReelsPage components
export default function ReelsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [reels, setReels] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);

    // Fetch Reels
    const fetchReels = useCallback(async (p = 1) => {
        try {
            setLoading(true);
            const res  = await getScroll(p, 10);
            const data = res?.data?.data?.reels || [];
            if (p === 1) { 
                setReels(data);
            } else {
                setReels(prev => [...prev, ...data]);
            }
            setHasMore(data.length === 10);
        } catch (err) { toast.error('Failed to load reels'); } 
        finally { setLoading(false) }
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handler = e => {
            if (e.key === 'ArrowDown') goNext();
            if (e.key === 'ArrowUp') goPrev();
        }
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [currentIndex, reels.length]);
    useEffect(() => { fetchReels(1) }, [fetchReels]);

    // If URL has an id, find and jump to that reel
    useEffect(() => {
        if (!id || reels.length === 0) return;
        const idx = reels.findIndex(r => r._id === id)
        if (idx !== -1) {
            setCurrentIndex(idx);
            scrollToIndex(idx, 'instant');
        }
    }, [id, reels]);

    // Update URL when current reel changes
    useEffect(() => {
        if (reels.length === 0) return;
        const reel = reels[currentIndex];
        if (reel) { navigate(`/reels/${reel._id}`, { replace: true }); }
    }, [currentIndex, reels]);

    // Load more when near end
    useEffect(() => {
        if (currentIndex >= reels.length - 3 && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchReels(nextPage);
        }
    }, [currentIndex, reels.length, hasMore, loading]);

    // Scroll
    const scrollToIndex = (idx, behavior = 'smooth') => {
        if (!containerRef.current) return;
        const items = containerRef.current.querySelectorAll('.reel-item');
        items[idx]?.scrollIntoView({ behavior, block: 'start' });
    }

    // Navigation handlers
    const goNext = () => {
        const next = Math.min(currentIndex + 1, reels.length - 1);
        setCurrentIndex(next);
        scrollToIndex(next);
    }
    const goPrev = () => {
        const prev = Math.max(currentIndex - 1, 0);
        setCurrentIndex(prev);
        scrollToIndex(prev);
    }

    // Detect scroll snap position
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;
        const h = containerRef.current.clientHeight;
        const idx = Math.round(containerRef.current.scrollTop / h);
        if (idx !== currentIndex) setCurrentIndex(idx);
    }, [currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handler = e => {
            if (e.key === 'ArrowDown') goNext();
            if (e.key === 'ArrowUp') goPrev();
        }
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [currentIndex, reels.length]);

    // Render loading, empty state, or reels
    if (loading && reels.length === 0){
        return (
            <div className="reels-loading">
                <p>Loading reels…</p>
            </div>
        );
    }

    // Empty state
    if (!loading && reels.length === 0) return (
        <div className="reels-loading">
            <p>No reels yet. Be the first to upload!</p>
            <button onClick={() => navigate('/create')} className="reels-upload-btn">
                Upload first reel
            </button>
        </div>
    );

    // Render reels page
    return (
        <div className="reels-page">
            <div className="reel-viewport">

                <div className="reel-container" ref={containerRef} onScroll={handleScroll} >
                    {reels.map((reel, i) => (
                        <ReelItem key={reel._id} reel={reel} isActive={i === currentIndex} />
                    ))}

                    {loading && reels.length > 0 && (
                        <div className="reel-loading-more">Loading more…</div>
                    )}
                </div>

                <div className="reel-nav">
                    <button className="reel-nav-btn" onClick={goPrev} disabled={currentIndex === 0} > <ChevronUp size={20} /> </button>
                    <span className="reel-counter"> {currentIndex + 1} / {reels.length} </span>
                    <button className="reel-nav-btn" onClick={goNext} disabled={currentIndex === reels.length - 1} > <ChevronDown size={20} /> </button>
                </div>

            </div>
        </div>
    );
}