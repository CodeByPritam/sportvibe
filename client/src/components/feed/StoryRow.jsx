import './StoryRow.css';

// Export StoryRow
export default function StoryRow({ creators }) {
    return (
        <div className="story-row">
            {creators.map(u => (
                <div key={u._id} className="story-card">
                    <div className="story-ring">
                    <div className="story-inner">{u.name?.[0]}</div>
                    </div>
                    <span className="story-name">{u.name?.split(' ')[0]}</span>
                </div>
            ))}
        </div>
    );
}