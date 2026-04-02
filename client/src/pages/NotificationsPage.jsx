import { useNotifications, useMarkAllRead } from '../hooks/useNotifications';
import './NotificationsPage.css';

// Type map
const TYPE_MAP = {
    like: { bg: '#e74c3c', icon: '❤️' },
    comment: { bg: '#2563eb', icon: '💬' },
    follow:  { bg: '#22a37c', icon: '👤' },
    mention: { bg: '#ffb347', icon: '@'  },
}

// time ago function
function timeAgo(date) {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400)return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
}

// NotificationsPage component
export default function NotificationsPage() {
    const { data, isLoading }  = useNotifications();
    const markAll = useMarkAllRead();
    const notifications = data?.data?.data?.notifications || [];
    const unreadCount = data?.data?.data?.unreadCount   || 0;

    // Render
    return (
        <div className="notif-page">

            <div className="notif-header">
                <div>
                    <h2>Notifications</h2>
                    <p className="notif-subtitle">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button className="mark-read-btn" onClick={() => markAll.mutate()}>Mark all read</button>
                )}
            </div>

            {isLoading ? <p className="loading-text">Loading…</p>
            : <div className="notif-list">
                {notifications.map(n => {
                    const t = TYPE_MAP[n.type] || TYPE_MAP.like
                    return (
                        <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                            <div className="notif-avatar" style={{ background: t.bg }}>
                                {n.sender?.name?.[0] || t.icon}
                            </div>
                            <div className="notif-content">
                                <p className="notif-text">
                                    <strong>{n.sender?.name}</strong> {n.message.replace(n.sender?.name || '', '').trim()}
                                </p>
                                <span className="notif-time">{timeAgo(n.createdAt)}</span>
                            </div>
                            {!n.isRead && <div className="notif-dot" />}
                        </div>
                    );
                })}
            </div>
            }
            
        </div>
    );
}