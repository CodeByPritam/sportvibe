import axios from 'axios';
import useAuthStore from '../store/authStore';

// Create Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' },
})

// Attach token
api.interceptors.request.use(config => {
    const token = useAuthStore.getState().accessToken
    if (token) { config.headers.Authorization = `Bearer ${token}`; }
    return config;
})

// Auto refresh on
api.interceptors.response.use(
    res => res,
    async err => {
        const original = err.config;
        if ( err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry ) {
            original._retry = true;

            // Attempt to refresh token
            try {
                const refreshToken = useAuthStore.getState().refreshToken;
                const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refreshToken });
                
                // Update tokens in store and retry original request
                useAuthStore.getState().setAuth({
                    accessToken:  data.data.accessToken,
                    refreshToken: data.data.refreshToken,
                });
                
                original.headers.Authorization = `Bearer ${data.data.accessToken}`;
                return api(original);

            } catch {
                useAuthStore.getState().clearAuth();
                window.location.href = '/auth';
            }
        }
        return Promise.reject(err);
    }
)

// Export
export default api;