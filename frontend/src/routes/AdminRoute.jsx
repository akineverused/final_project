import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null;

    if (!user) return <Navigate to="/login" />;
    if (user.role !== "ADMIN") return <Navigate to="/" />;

    return children;
};