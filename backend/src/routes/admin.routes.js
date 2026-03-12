import express from "express";
import {adminOnly, protect} from "../middleware/auth.middleware.js";
import prisma from "../lib/prisma.js";
import {deleteImageFromCloud} from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, async (req, res) => {
    res.json({ message: "Welcome admin" });
});

router.get("/users", protect, adminOnly, async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            blocked: true,
            verified: true,
            createdAt: true
        },
        orderBy: { createdAt: "desc" }
    });

    res.json(users);
});

router.patch("/users/block", protect, adminOnly, async (req, res) => {
    const { ids } = req.body;

    await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { blocked: true }
    });

    res.json({ message: "Users blocked" });
});

router.patch("/users/unblock", protect, adminOnly, async (req, res) => {
    const { ids } = req.body;

    await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { blocked: false }
    });

    res.json({ message: "Users unblocked" });
});

router.delete("/users/delete", protect, adminOnly, async (req, res) => {
    const { ids } = req.body;

    if (ids.includes(req.user.id)) {
        return res.status(400).json({ message: "You cannot delete yourself" });
    }

    try {

        const inventories = await prisma.inventory.findMany({
            where: { ownerId: { in: ids } },
            select: { imageUrl: true }
        });

        for (const inv of inventories) {
            if (inv.imageUrl) {
                await deleteImageFromCloud(inv.imageUrl);
            }
        }

        await prisma.user.deleteMany({
            where: { id: { in: ids } }
        });

        res.json({ message: "Users deleted" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.patch("/users/make-admin", protect, adminOnly, async (req, res) => {
    const { ids } = req.body;

    const user = await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { role: "ADMIN" }
    });

    res.json(user);
});

router.patch("/users/remove-admin", protect, adminOnly, async (req, res) => {
    const { ids } = req.body;

    const user = await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { role: "USER" }
    });

    res.json(user);
});

router.get("/inventories", protect, adminOnly, async (req, res) => {
    const inventories = await prisma.inventory.findMany({
        include: {
            owner: {
                select: { email: true }
            }
        }
    });

    res.json(inventories);
});

router.delete("/inventories/delete", protect, adminOnly, async (req, res) => {
    const { ids } = req.body;

    await prisma.inventory.deleteMany({
        where: { id: { in: ids } }
    });

    res.json({ message: "Inventories deleted" });
});

router.delete("/users/unverified", protect, adminOnly, async (req, res) => {
    try {

        const result = await prisma.user.deleteMany({
            where: {
                verified: false
            }
        });

        res.json({
            message: "Unverified users deleted",
            count: result.count
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;