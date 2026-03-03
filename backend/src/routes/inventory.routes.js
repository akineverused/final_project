import express from "express";
import prisma from "../lib/prisma.js";
import { protect } from "../middleware/auth.middleware.js";
import {canEditInventory, canManageInventory, canViewInventory} from "../../utils/access.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
    try {
        const { title, description, category, isPublic, tags } = req.body;

        // создаём инвентарь
        const inventory = await prisma.inventory.create({
            data: {
                title,
                description,
                category,
                isPublic,
                ownerId: req.user.id
            }
        });

        // если есть теги
        if (tags?.length) {
            for (const tagName of tags) {
                const tag = await prisma.tag.upsert({
                    where: { name: tagName },
                    update: {},
                    create: { name: tagName }
                });

                await prisma.inventoryTag.create({
                    data: {
                        inventoryId: inventory.id,
                        tagId: tag.id
                    }
                });
            }
        }

        res.json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/", async (req, res) => {
    try {
        const inventories = await prisma.inventory.findMany({
            include: {
                owner: {
                    select: { id: true, email: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.json(inventories);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:id", protect, async (req, res) => {
    try {
        const { id } = req.params;

        const inventory = await prisma.inventory.findUnique({
            where: { id: Number(id) },
            include: {
                accessList: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true
                            }
                        }
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                items: {
                    include: {
                        fieldValues: {
                            include: { customField: true }
                        }
                    }
                },
                fields: true
            }
        });

        if (!inventory) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json(inventory);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/:id", protect, async (req, res) => {
    try {
        const inventoryId = Number(req.params.id);
        const { title, description, category, isPublic, tags, imageUrl, version } = req.body;

        const inventory = await prisma.inventory.findUnique({
            where: { id: inventoryId }
        });

        if (!inventory) {
            return res.status(404).json({ message: "Not found" });
        }

        if (!canManageInventory(req.user, inventory)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // 🔐 Проверка версии вручную
        if (inventory.version !== version) {
            return res.status(409).json({
                message: "Inventory was modified by another user"
            });
        }

        // создаём/находим теги
        let tagRecords = [];

        if (tags?.length) {
            tagRecords = await Promise.all(
                tags.map(tagName =>
                    prisma.tag.upsert({
                        where: { name: tagName },
                        update: {},
                        create: { name: tagName }
                    })
                )
            );
        }

        const updated = await prisma.inventory.update({
            where: { id: inventoryId },
            data: {
                title,
                description,
                category,
                isPublic,
                imageUrl,
                version: { increment: 1 },
                tags: {
                    deleteMany: {},
                    create: tagRecords.map(tag => ({
                        tagId: tag.id
                    }))
                }
            }
        });

        res.json(updated);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/:id/access", protect, async (req, res) => {
    const { userId } = req.body;

    const inventory = await prisma.inventory.findUnique({
        where: { id: Number(req.params.id) }
    });

    if (
        inventory.ownerId !== req.user.id &&
        req.user.role !== "ADMIN"
    ) {
        return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.inventoryAccess.create({
        data: {
            inventoryId: inventory.id,
            userId
        }
    });

    res.json({ message: "Access granted" });
});

router.delete("/:id/access", protect, async (req, res) => {
    const inventoryId = Number(req.params.id);
    const { userIds } = req.body;

    const inventory = await prisma.inventory.findUnique({
        where: { id: inventoryId }
    });

    if (!inventory) {
        return res.status(404).json({ message: "Not found" });
    }

    if (
        inventory.ownerId !== req.user.id &&
        req.user.role !== "ADMIN"
    ) {
        return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.inventoryAccess.deleteMany({
        where: {
            inventoryId,
            userId: { in: userIds }
        }
    });

    res.json({ message: "Access removed" });
});

router.delete("/:id", protect, async (req, res) => {
    try {
        const inventory = await prisma.inventory.findUnique({
            where: { id: Number(req.params.id) }
        });

        if (!inventory) {
            return res.status(404).json({ message: "Not found" });
        }

        if (
            inventory.ownerId !== req.user.id &&
            req.user.role !== "ADMIN"
        ) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await prisma.inventory.delete({
            where: { id: inventory.id }
        });

        res.json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/:id/custom-id", protect, async (req, res) => {
    const inventoryId = Number(req.params.id);
    const { customIdConfig, version } = req.body;

    const inventory = await prisma.inventory.findUnique({
        where: { id: inventoryId }
    });

    if (!canManageInventory(req.user, inventory)) {
        return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await prisma.inventory.updateMany({
        where: {
            id: inventoryId,
            version: version
        },
        data: {
            customIdConfig,
            version: { increment: 1 }
        }
    });

    if (updated.count === 0) {
        return res.status(409).json({
            message: "Inventory was modified by another user"
        });
    }

    res.json({ message: "Custom ID updated" });
});

router.get("/tags/search", async (req, res) => {
    const { q } = req.query;

    const tags = await prisma.tag.findMany({
        where: {
            name: {
                startsWith: q,
                mode: "insensitive"
            }
        },
        take: 10
    });

    res.json(tags);
});

router.get("/:id/statistics", protect, async (req, res) => {
    try {
        const inventoryId = Number(req.params.id);

        const inventory = await prisma.inventory.findUnique({
            where: { id: inventoryId },
            include: {
                items: {
                    include: {
                        fieldValues: {
                            include: {
                                customField: true
                            }
                        }
                    }
                },
                fields: true
            }
        });

        if (!inventory) {
            return res.status(404).json({ message: "Not found" });
        }

        const items = inventory.items;

        const stats = {
            totalItems: items.length,
            numeric: {},
            string: {}
        };

        // группируем по customField
        for (const field of inventory.fields) {

            if (field.type === "NUMBER") {
                const values = items
                    .flatMap(item =>
                        item.fieldValues
                            .filter(fv => fv.customFieldId === field.id)
                            .map(fv => fv.numberValue)
                    )
                    .filter(v => !isNaN(v));

                if (values.length > 0) {
                    stats.numeric[field.title] = {
                        avg: values.reduce((a, b) => a + b, 0) / values.length,
                        min: Math.min(...values),
                        max: Math.max(...values)
                    };
                }
            }

            if (field.type === "STRING" || field.type === "SELECT") {
                const values = items
                    .flatMap(item =>
                        item.fieldValues
                            .filter(fv => fv.customFieldId === field.id)
                            .map(fv => fv.stringValue)
                    )
                    .filter(Boolean);

                const frequency = {};

                for (const val of values) {
                    frequency[val] = (frequency[val] || 0) + 1;
                }

                const sorted = Object.entries(frequency)
                    .sort((a, b) => b[1] - a[1]);

                if (sorted.length > 0) {
                    stats.string[field.title] = {
                        mostFrequent: sorted[0][0],
                        count: sorted[0][1]
                    };
                }
            }
        }

        res.json(stats);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:id/comments", protect, async (req, res) => {
    const comments = await prisma.comment.findMany({
        where: { inventoryId: Number(req.params.id) },
        include: {
            user: {
                select: { id: true, email: true }
            }
        },
        orderBy: { createdAt: "asc" }
    });

    res.json(comments);
});

router.post("/:id/comments", protect, async (req, res) => {
    const { content } = req.body;

    const comment = await prisma.comment.create({
        data: {
            content,
            inventoryId: Number(req.params.id),
            userId: req.user.id
        },
        include: {
            user: {
                select: { id: true, email: true }
            }
        }
    });

    res.json(comment);
});




export default router;