import express from "express";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (user.blocked) {
            return res.status(403).json({ message: "User is blocked" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// PROTECTED ROUTE
router.get("/profile", protect, async (req, res) => {
    res.json({ message: "You are authorized", user: req.user });
});

// поиск пользователей по email
router.get("/search", protect, async (req, res) => {
    const { q } = req.query;

    if (!q) return res.json([]);

    const users = await prisma.user.findMany({
        where: {
            email: {
                contains: q,
                mode: "insensitive"
            }
        },
        select: {
            id: true,
            email: true
        },
        take: 10
    });

    res.json(users);
});

router.get("/:id/profile", protect, async (req, res) => {
    const userId = Number(req.params.id);

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const ownedInventories = await prisma.inventory.findMany({
        where: { ownerId: userId },
        include: { tags: { include: { tag: true } } }
    });

    const accessibleInventories = await prisma.inventory.findMany({
        where: {
            accessList: {
                some: { userId }
            }
        }
    });

    res.json({
        user,
        ownedInventories,
        accessibleInventories
    });
});

export default router;