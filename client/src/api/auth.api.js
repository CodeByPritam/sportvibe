import api from './axios';

// Export authentication functions
export const login = body => api.post('/auth/login', body);
export const register = body => api.post('/auth/register', body);
export const logout = body => api.post('/auth/logout', body);
export const getMe = () => api.get('/auth/me');