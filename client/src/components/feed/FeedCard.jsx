import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import { useLikeReel } from '../../hooks/useReels';
import toast from 'react-hot-toast';
import './FeedCard.css';

// Sports emojis mapping
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

// FaceCard components
export default function FeedCard({ reel }) {
    const [liked, setLiked] = useState(reel.isLiked);
    const [count, setCount] = useState(reel.likesCount);
    const [muted, setMuted] = useState(true);
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef(null);
    const cardRef = useRef(null);
    const likeMutation = useLikeReel();
    const emoji = SPORT_EMOJI[reel.sport] || '🎥';

    // Auto play when card scrolls into view
    useEffect(() => {
        if (!videoRef.current || !reel.videoUrl) return;

        // Start with video muted
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.6) { 
                        videoRef.current?.play()
                        .then(() => setPlaying(true))
                        .catch(() => setPlaying(false))
                    } else {
                        videoRef.current?.pause();
                        setPlaying(false);
                    }
                })
            },
            { threshold: 0.6 }
        );

        // Observe the card element
        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [reel.videoUrl]);

    // Handle like button click
    const handleLike = () => {
        setLiked(p => !p);
        setCount(p => liked ? p - 1 : p + 1);
        likeMutation.mutate(reel._id);
    }

    // Handle share button click
    const handleShare = () => {
        navigator.clipboard?.writeText(window.location.origin + '/reels');
        toast.success('Link copied!');
    }

    // Toggle mute/unmute
    const toggleMute = e => {
        e.stopPropagation();
        setMuted(p => !p);
        if (videoRef.current) videoRef.current.muted = !muted;
    }

    // Render the feed card
    return (
        <div className="feed-card" ref={cardRef}>

            <div className="feed-card-header">
                <div className="feed-avatar">{reel.user?.name?.[0] || 'U'}</div>
                <div className="feed-user-info">
                    <span className="feed-uname">{reel.user?.name}</span>
                    <span className="feed-umeta">@{reel.user?.username} · {reel.location || reel.user?.location}</span>
                </div>
                <span className="feed-badge">{emoji} {reel.sport}</span>
            </div>

            <div className="feed-thumb">{reel.videoUrl ? 
                <>
                    <video ref={videoRef} src={reel.videoUrl} className="feed-video" loop muted={muted} playsInline preload="metadata"/>
                    <button className="feed-mute-btn" onClick={toggleMute}>
                        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    {!playing && (
                        <div className="feed-pause-overlay">
                            <div className="feed-play-circle">▶</div>
                        </div>
                    )}
                </>
            : <span className="feed-thumb-emoji">{emoji}</span>}
            </div>

            <div className="feed-body">
                <p className="feed-caption">
                    <strong>{reel.title}</strong><br/>
                    <span>{reel.caption}</span>
                </p>
            </div>

            <div className="feed-actions">
                <button className={`feed-action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
                    <Heart size={15} fill={liked ? 'currentColor' : 'none'} /> {count}
                </button>
                <button className="feed-action-btn">
                    <MessageCircle size={15} /> {reel.commentsCount}
                </button>
                <button className="feed-action-btn feed-action-share" onClick={handleShare}>
                    <Share2 size={15} /> Share
                </button>
            </div>
            
        </div>
    );
}