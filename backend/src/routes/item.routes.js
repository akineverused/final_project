import express from "express";
import prisma from "../lib/prisma.js";
import {protect} from "../middleware/auth.middleware.js";
import {canCreateItem} from "../../utils/access.js";
import {generateCustomId} from "../../utils/customIdGenerator.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
    const { inventoryId, values } = req.body;

    if (!req.user.verified) {
        return res.status(403).json({
            message: "Verify your email to create items"
        });
    }

    const inventory = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        include: { accessList: true }
    });

    if (!inventory) {
        return res.status(404).json({ message: "Inventory not found" });
    }

    if (!canCreateItem(req.user, inventory)) {
        return res.status(403).json({ message: "Forbidden" });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {

            const updatedInventory = await tx.inventory.update({
                where: { id: inventoryId },
                data: { sequenceCounter: { increment: 1 } }
            });

            const sequenceNumber = updatedInventory.sequenceCounter;

            let customId;

            if (!updatedInventory.customIdConfig || updatedInventory.customIdConfig.length === 0) {
                customId = `ITEM-${sequenceNumber}`;
            } else {
                customId = generateCustomId(updatedInventory, sequenceNumber);
            }

            const item = await tx.item.create({
                data: {
                    customId,
                    inventoryId,
                    createdById: req.user.id,
                    fieldValues: {
                        create: values.map(v => {

                            const base = {
                                customFieldId: v.customFieldId
                            };

                            if (v.value === null || v.value === undefined || v.value === "") {
                                return base;
                            }

                            if (v.type === "STRING" || v.type === "SELECT") {
                                return { ...base, stringValue: v.value };
                            }

                            if (v.type === "NUMBER") {
                                const num = Number(v.value);
                                if (isNaN(num)) return base;
                                return { ...base, numberValue: num };
                            }

                            if (v.type === "BOOLEAN") {
                                return { ...base, booleanValue: v.value };
                            }

                            return base;
                        })
                    }
                },
                include: { fieldValues: true }
            });

            return item;
        });

        res.json(result);

    } catch (error) {
        console.error(error);

        if (error.code === "P2002") {
            return res.status(400).json({
                message: "Custom ID must be unique"
            });
        }

        res.status(500).json({
            message: "Failed to create item"
        });
    }
});

router.put("/:id", protect, async (req, res) => {
    const itemId = Number(req.params.id);
    const { values } = req.body;

    const item = await prisma.item.findUnique({
        where: { id: itemId },
        include: { inventory: true }
    });

    if (!item) {
        return res.status(404).json({ message: "Not found" });
    }

    for (const v of values) {
        const data = {};

        if (v.type === "STRING" || v.type === "TEXT" || v.type === "LINK") {
            data.stringValue = v.value ?? null;
        }

        if (v.type === "NUMBER") {
            data.numberValue =
                v.value !== null && v.value !== undefined
                    ? Number(v.value)
                    : null;
        }

        if (v.type === "BOOLEAN") {
            data.booleanValue = Boolean(v.value);
        }

        await prisma.itemFieldValue.upsert({
            where: {
                itemId_customFieldId: {
                    itemId,
                    customFieldId: v.customFieldId
                }
            },
            update: data,
            create: {
                itemId,
                customFieldId: v.customFieldId,
                ...data
            }
        });
    }

    res.json({ message: "Item updated" });
});

router.delete("/:id", protect, async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.item.delete({
            where: { id: Number(id) }
        });

        res.json({ message: "Item deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete item" });
    }
});

router.get("/:id", async (req, res) => {
    const item = await prisma.item.findUnique({
        where: { id: Number(req.params.id) },
        include: {
            inventory: true,
            fieldValues: {
                include: { customField: true }
            }
        }
    });

    if (!item) {
        return res.status(404).json({ message: "Not found" });
    }

    res.json(item);
});

router.post("/:id/like", protect, async (req, res) => {

    if (!req.user.verified) {
        return res.status(403).json({
            message: "Verify your email to like items"
        });
    }

    try {
        await prisma.like.create({
            data: {
                userId: req.user.id,
                itemId: Number(req.params.id)
            }
        });

        res.json({ message: "Liked" });

    } catch (error) {
        res.status(400).json({ message: "Already liked" });
    }
});

router.delete("/:id/like", protect, async (req, res) => {
    await prisma.like.delete({
        where: {
            userId_itemId: {
                userId: req.user.id,
                itemId: Number(req.params.id)
            }
        }
    });

    res.json({ message: "Unliked" });
});

router.get("/:id/likes", async (req, res) => {
    const itemId = Number(req.params.id);

    const count = await prisma.like.count({
        where: { itemId }
    });

    const userLike = await prisma.like.findUnique({
        where: {
            userId_itemId: {
                userId: req.user.id,
                itemId
            }
        }
    });

    res.json({
        count,
        liked: !!userLike
    });
});

export default router;