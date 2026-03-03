import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const q = req.query.q;

    if (!q) return res.json([]);

    const results = await prisma.inventory.findMany({
        where: {
            OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                {
                    tags: {
                        some: {
                            tag: {
                                name: { contains: q, mode: "insensitive" }
                            }
                        }
                    }
                }
            ]
        },
        include: {
            owner: true,
            tags: { include: { tag: true } }
        }
    });

    res.json(results);
});


export default router;