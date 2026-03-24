import axios from "axios";

const localUrl = "http://localhost:5000/api"
const baseURL = "https://final-project-3uz3.onrender.com/api"

const api = axios.create({
    baseURL: baseURL
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem("token");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;