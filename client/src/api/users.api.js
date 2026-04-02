import api from './axios';

// Export user related API calls
export const getTrending = () => api.get('/users/trending/creators');
export const getUser = id => api.get(`/users/${id}`);
export const updateProfile = body => api.put('/users/profile', body);
export const followUser = id => api.post(`/users/${id}/follow`);