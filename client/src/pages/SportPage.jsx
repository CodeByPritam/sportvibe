import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSportFeed }from '../api/reels.api';
import FeedCard from '../components/feed/FeedCard';
import './SportPage.css';

// Sports info
const SPORT_INFO = {
    football: { emoji:'⚽', label:'Football' },
    basketball: { emoji:'🏀', label:'Basketball' },
    tennis: { emoji:'🎾', label:'Tennis' },
    cricket: { emoji:'🏏', label:'Cricket' },
    formula1: { emoji:'🏎️', label:'Formula 1' },
    boxing: { emoji:'🥊', label:'Boxing' },
    swimming: { emoji:'🏊', label:'Swimming' },
    athletics: { emoji:'🏃', label:'Athletics' },
}

// Sports page component
export default function SportPage() {
    const { sport } = useParams();
    const info = SPORT_INFO[sport] || { emoji:'🏆', label: sport };

    // Sport feed using React Query
    const { data, isLoading, error } = useQuery({
        queryKey: ['sport', sport],
        queryFn: () => getSportFeed(sport),
        enabled:  !!sport,
    })

    // Extract reels from API response
    const reels = data?.data?.data?.reels || [];

    // Render
    return (
        <div className="sport-page">

            <div className="sport-banner">
                <span className="sport-banner-emoji">{info.emoji}</span>
                <div>
                    <h2>{info.label}</h2>
                    <p>Latest reels from the {info.label} community</p>
                </div>
            </div>

            <div className="sport-feed">
                {isLoading && <p className="loading-text">Loading…</p>}

                {error && (
                    <p className="loading-text" style={{color:'var(--accent)'}}>
                        Error: {error.message}
                    </p>
                )}

                {!isLoading && !error && reels.length === 0 && (
                    <p className="loading-text">No reels yet for {info.label}</p>
                )}

                {reels.length > 0 && (
                    <div className="feed-grid">
                        {reels.map(reel => <FeedCard key={reel._id} reel={reel} />)}
                    </div>
                )}
            </div>

        </div>
    );
}