import { useQuery } from '@tanstack/react-query';
import { useFeed } from '../hooks/useReels';
import { getTrending } from '../api/users.api';
import FeedCard from '../components/feed/FeedCard';
import StoryRow from '../components/feed/StoryRow';
import './HomePage.css';

// Export HomePage component
export default function HomePage() {
    const { data: feedData, isLoading } = useFeed(1);
    const { data: trendingData } = useQuery({ queryKey: ['trending'], queryFn: getTrending });

    // Safely access reels and creators data
    const reels = feedData?.data?.data?.reels || [];
    const creators = trendingData?.data?.data?.users || [];

    // Render 
    return (
        <div className="home-page">

            <div className="home-hero">
                <h2>Your Sports Feed, Live & Unfiltered</h2>
                <p>Scroll through the best sports reels and highlights from around the world.</p>
            </div>

            <div className="section-header">
                <h3>Trending Creators</h3>
            </div>

            <StoryRow creators={creators} />

            <div className="section-header" style={{marginTop:'28px'}}>
                <h3>For You</h3>
            </div>

            {isLoading ? <p className="loading-text">Loading feed…</p> : 
            <div className="feed-grid">
            {reels.map((reel, i) => (
                <div key={reel._id} style={{ animationDelay: `${i * 0.07}s` }}>
                    <FeedCard reel={reel} />
                </div>
            ))}
            </div>
        }
    </div>
    );
    
}