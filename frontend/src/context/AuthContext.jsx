import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(
        sessionStorage.getItem("token") || null
    );

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.get("/users/profile");
                setUser(res.data.user);
            } catch {
                sessionStorage.removeItem("token");
                setToken(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [token]);

    const register = async (email, password) => {
        const res = await api.post("/users/register", { email, password });
        sessionStorage.setItem("token", res.data.token);
        setToken(res.data.token);
    };

    const login = async (email, password) => {
        const res = await api.post("/users/login", { email, password });
        sessionStorage.setItem("token", res.data.token);
        setToken(res.data.token);
    };

    const logout = () => {
        sessionStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ token, user, loading, register, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};