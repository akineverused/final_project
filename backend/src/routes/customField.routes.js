import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

router.get("/:inventoryId", async (req, res) => {
    const inventoryId = Number(req.params.inventoryId);

    const fields = await prisma.customField.findMany({
        where: { inventoryId },
        orderBy: { order: "asc" }
    });

    res.json(fields);
});

router.put("/:inventoryId", async (req, res) => {
    const inventoryId = Number(req.params.inventoryId);
    const { fields } = req.body;

    try {
        const typeCount = {};
        for (const field of fields) {
            typeCount[field.type] = (typeCount[field.type] || 0) + 1;
            if (typeCount[field.type] > 3) {
                return res.status(400).json({ message: "Maximum 3 fields per type allowed" });
            }
        }

        await prisma.$transaction(async (tx) => {
            const existing = await tx.customField.findMany({ where: { inventoryId } });

            const existingIds = existing.map(f => f.id);
            const incomingIds = fields.filter(f => f.id).map(f => f.id);

            const toDelete = existingIds.filter(id => !incomingIds.includes(id));
            if (toDelete.length) {
                await tx.customField.deleteMany({ where: { id: { in: toDelete } } });
            }

            for (let i = 0; i < fields.length; i++) {
                const field = fields[i];
                if (!field.id) {
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

            const updates = fields.filter(f => f.id);
            for (let i = 0; i < updates.length; i++) {
                await tx.customField.update({
                    where: { id: updates[i].id },
                    data: { order: -(i + 1) }
                });
            }

            for (let i = 0; i < updates.length; i++) {
                await tx.customField.update({
                    where: { id: updates[i].id },
                    data: {
                        title: updates[i].title,
                        type: updates[i].type,
                        order: i + 1
                    }
                });
            }
        });

        res.json({ message: "Fields updated" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update fields" });
    }
});

export default router;