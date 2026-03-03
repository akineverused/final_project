import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// GET fields
router.get("/:inventoryId", async (req, res) => {
    const inventoryId = Number(req.params.inventoryId);

    const fields = await prisma.customField.findMany({
        where: { inventoryId },
        orderBy: { order: "asc" }
    });

    res.json(fields);
});

// BATCH UPDATE
router.put("/:inventoryId", async (req, res) => {
    const inventoryId = Number(req.params.inventoryId);
    const { fields } = req.body;

    try {
        await prisma.$transaction(async (tx) => {
            const existing = await tx.customField.findMany({
                where: { inventoryId }
            });

            const existingIds = existing.map(f => f.id);
            const incomingIds = fields
                .filter(f => f.id)
                .map(f => f.id);

            // 1️⃣ DELETE
            const toDelete = existingIds.filter(
                id => !incomingIds.includes(id)
            );

            if (toDelete.length) {
                await tx.customField.deleteMany({
                    where: {
                        id: { in: toDelete }
                    }
                });
            }

            // 2️⃣ UPDATE + CREATE
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i];

                if (field.id) {
                    // UPDATE
                    await tx.customField.update({
                        where: { id: field.id },
                        data: {
                            title: field.title,
                            type: field.type,
                            order: i + 1
                        }
                    });
                } else {
                    // CREATE
                    await tx.customField.create({
                        data: {
                            title: field.title,
                            type: field.type,
                            inventoryId,
                            order: i + 1,
                            showInTable: true
                        }
                    });
                }
            }
        });

        res.json({ message: "Fields updated" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update fields" });
    }
});

export default router;