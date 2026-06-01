import axios, {AxiosInstance} from "axios";
import { getAccessToken, refreshAccessToken, clearTokens } from "./token";

export const URL = "https://api.instructli.app";
// export const URL = "http://localhost:8000";

const api: AxiosInstance = axios.create({
    baseURL: URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// inject jwt for auth
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    },
    (error) => Promise.reject(error)
)

// refresh tokens as needed
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If already tried refresh once, don't retry again
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const newAccess = await refreshAccessToken();
            if (newAccess) {
                originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
                return api(originalRequest); // Retry original request
            }
            clearTokens();
        }

        return Promise.reject(error);
    }
)

export default api;
