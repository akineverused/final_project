import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {

    const latest = await prisma.inventory.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { owner: true }
    });

    const popular = await prisma.inventory.findMany({
        orderBy: {
            items: {
                _count: "desc"
            }
        },
        take: 5,
        include: {
            _count: {
                select: { items: true }
            }
        }
    });

    const tags = await prisma.tag.findMany({
        include: {
            inventories: true
        }
    });

    res.json({ latest, popular, tags });
});

export default router;