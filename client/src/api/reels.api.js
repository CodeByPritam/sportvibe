import api from './axios';

// Export Reels API functions
export const getFeed = (page=1, limit=10) => api.get(`/reels/feed?page=${page}&limit=${limit}`);
export const getScroll = (page=1, limit=5) => api.get(`/reels/scroll?page=${page}&limit=${limit}`);
export const getSportFeed = (sport, page=1) => api.get(`/reels/sport/${sport}?page=${page}`);
export const likeReel = id => api.post(`/reels/${id}/like`);
export const commentReel = (id, text) => api.post(`/reels/${id}/comment`, { text });
export const createReel = body => api.post('/reels', body);
export const deleteReel = id => api.delete(`/reels/${id}`);