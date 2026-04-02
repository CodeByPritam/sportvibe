import api from './axios';

// Export notifications API functions
export const getNotifications = (page=1) => api.get(`/notifications?page=${page}`);
export const markAllRead = () => api.patch('/notifications/read-all');
export const markOneRead = id => api.patch(`/notifications/${id}/read`);