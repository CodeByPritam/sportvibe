import { useState } from 'react';
import { Heart, MessageCircle, Share2, Play } from 'lucide-react';
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
    const likeMutation = useLikeReel();
    const emoji = SPORT_EMOJI[reel.sport] || '🎥';

    // Handle like button click
    const handleLike = () => {
        setLiked(p => !p);
        setCount(p => liked ? p - 1 : p + 1);
        likeMutation.mutate(reel._id);
    }

    const handleShare = () => {
        navigator.clipboard?.writeText(window.location.origin + '/reels');
        toast.success('Link copied!');
    }

    // Render the feed card
    return (
        <div className="feed-card">

            <div className="feed-card-header">
                <div className="feed-avatar">{reel.user?.name?.[0] || 'U'}</div>
                <div className="feed-user-info">
                    <span className="feed-uname">{reel.user?.name}</span>
                    <span className="feed-umeta">@{reel.user?.username} · {reel.location || reel.user?.location}</span>
                </div>
                <span className="feed-badge">{emoji} {reel.sport}</span>
            </div>

            <div className="feed-thumb">
                {reel.thumbnailUrl
                    ? <img src={reel.thumbnailUrl} alt={reel.title} />
                    : <span className="feed-thumb-emoji">{emoji}</span>
                }
                <div className="feed-play-overlay"><Play size={28} /></div>
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