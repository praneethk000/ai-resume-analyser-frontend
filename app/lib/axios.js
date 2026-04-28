import axios from "axios"

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') return `http://${window.location.hostname}:8080`;
    return 'http://localhost:8080';
};

const api = axios.create({
    baseURL: getBaseUrl()
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('resumeai_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});



api.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('resumeai_user');
            localStorage.removeItem('resumeai_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

