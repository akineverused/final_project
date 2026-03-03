import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.sendStatus(401);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user || user.blocked) {
            return res.sendStatus(403);
        }

        req.user = user;
        next();
    } catch (err) {
        res.sendStatus(401);
    }
};

export const adminOnly = (req, res, next) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied" });
    }

    next();
};