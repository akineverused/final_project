import express from "express";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail } from "../lib/mailer.js";
import jwt from "jsonwebtoken";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password, nickname } = req.body;

        const existingNickname = await prisma.user.findUnique({
            where: { nickname }
        });

        if (existingNickname) {
            return res.status(400).json({ message: "Nickname already taken" });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verifyToken = crypto.randomUUID();

        const user = await prisma.user.create({
            data: {
                email,
                nickname,
                password: hashedPassword,
                verifyToken
            }
        });

        await sendVerificationEmail(email, verifyToken);

        res.json({
            message: "Registered. Please verify your email."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/verify/:token", async (req, res) => {
    const { token } = req.params;

    const user = await prisma.user.findUnique({
        where: { verifyToken: token }
    });

    if (!user) {
        return res.status(400).send("Invalid verification link");
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            verified: true,
            verifyToken: null
        }
    });

    res.send("Email confirmed. You can login now.");
});

router.post("/login", async (req, res) => {
    try {
        const { login, password } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: login },
                    { nickname: login }
                ]
            }
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

router.get("/profile", protect, async (req, res) => {
    res.json({ message: "You are authorized", user: req.user });
});

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