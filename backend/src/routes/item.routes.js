import express from "express";
import prisma from "../lib/prisma.js";
import {protect} from "../middleware/auth.middleware.js";
import {canCreateItem} from "../../utils/access.js";
import {generateCustomId} from "../../utils/customIdGenerator.js";

const router = express.Router();

// создать item
router.post("/", protect, async (req, res) => {
    const { inventoryId, values } = req.body;

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

            const customId = generateCustomId(updatedInventory, sequenceNumber);

            const item = await tx.item.create({
                data: {
                    customId,
                    inventoryId,
                    createdById: req.user.id,
                    fieldValues: {
                        create: values.map(v => ({
                            customFieldId: v.customFieldId,
                            value: String(v.value)
                        }))
                    }
                },
                include: { fieldValues: true }
            });

            return item;
        });

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Custom ID conflict. Please edit manually."
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

    await prisma.itemFieldValue.deleteMany({
        where: { itemId }
    });

    await prisma.itemFieldValue.createMany({
        data: values.map(v => ({
            itemId,
            customFieldId: v.customFieldId,
            value: String(v.value)
        }))
    });

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

router.get("/:id", protect, async (req, res) => {
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

router.get("/:id/likes", protect, async (req, res) => {
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