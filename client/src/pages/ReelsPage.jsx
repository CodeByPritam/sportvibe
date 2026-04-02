import { useState, useRef, useEffect } from 'react';
import { useScrollReels } from '../hooks/useReels';
import { likeReel } from '../api/reels.api';
import { Heart, MessageCircle, Share2, ChevronUp, ChevronDown, Play, Volume2, VolumeX } from 'lucide-react'
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
    const [muted, setMuted]     = useState(false)
    const videoRef  = useRef(null);
    const emoji = SPORT_EMOJI[reel.sport] || '🎥';

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
    const handleLike = async () => {
        setLiked(p => !p);
        setCount(p => liked ? p - 1 : p + 1);
        try { 
            await likeReel(reel._id); 
        } catch { 
            setLiked(p => !p); setCount(p => liked ? p + 1 : p - 1); 
        }
    }

    // Handle share (copy link)
    const handleShare = () => {
        navigator.clipboard?.writeText(window.location.origin + '/reels');
        toast.success('Link copied!');
    }

    // Render reel item
    return (
        <div className="reel-item">

            <div className="reel-bg" onClick={togglePlay}>
            {reel.videoUrl ? <video ref={videoRef} src={reel.videoUrl} loop muted playsInline className="reel-video" />
                : <div className="reel-emoji-bg">{emoji}</div>
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);
    const { data, isLoading } = useScrollReels(1);
    const reels = data?.data?.data?.reels || [];

    // Keyboard navigation
    useEffect(() => {
        const handler = e => {
            if (e.key === 'ArrowDown') goNext();
            if (e.key === 'ArrowUp') goPrev();
        }
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [currentIndex, reels.length]);

    // Sync scroll
    useEffect(() => {
        if (!containerRef.current) return;
        const items = containerRef.current.querySelectorAll('.reel-item');
        items[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [currentIndex]);

    // Navigation handlers
    const goNext = () => setCurrentIndex(p => Math.min(p + 1, reels.length - 1));
    const goPrev = () => setCurrentIndex(p => Math.max(p - 1, 0));

    // Detect scroll snap position
    const handleScroll = () => {
        if (!containerRef.current) return;
        const h = containerRef.current.clientHeight;
        const idx = Math.round(containerRef.current.scrollTop / h);
        setCurrentIndex(idx);
    }

    // Render loading, empty state, or reels
    if (isLoading) return (
        <div className="reels-loading">
            <p>Loading reels…</p>
        </div>
    );

    // Empty state
    if (reels.length === 0) return (
        <div className="reels-loading">
            <p>No reels yet. Be the first to upload!</p>
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
                </div>

                <div className="reel-nav">
                    <button className="reel-nav-btn" onClick={goPrev} disabled={currentIndex === 0} > <ChevronUp size={20} /> </button>
                    <button className="reel-nav-btn" onClick={goNext} disabled={currentIndex === reels.length - 1} > <ChevronDown size={20} /> </button>
                </div>

            </div>
        </div>
    );
}