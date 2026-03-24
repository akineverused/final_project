import express from "express";
import prisma from "../lib/prisma.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadJsonToDropbox } from "../lib/dropbox.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
    try {
        const { summary, priority, inventoryId, link } = req.body;

        if (!summary || !priority || !link) {
            return res.status(400).json({
                message: "summary, priority and link are required"
            });
        }

        const allowedPriorities = ["High", "Average", "Low"];

        if (!allowedPriorities.includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        let inventoryTitle = null;

        if (inventoryId) {
            const inventory = await prisma.inventory.findUnique({
                where: { id: Number(inventoryId) },
                select: { id: true, title: true }
            });

            if (!inventory) {
                return res.status(404).json({ message: "Inventory not found" });
            }

            inventoryTitle = inventory.title;
        }

        const admins = await prisma.user.findMany({
            where: { role: "ADMIN" },
            select: { email: true }
        });

        const adminEmails = admins.map(admin => admin.email);

        const now = new Date();

        const ticketPayload = {
            reportedBy: {
                id: req.user.id,
                email: req.user.email,
                nickname: req.user.nickname
            },
            inventory: inventoryTitle,
            link,
            priority,
            summary,
            adminEmails,
            createdAt: now.toISOString()
        };

        const safeDate = now.toISOString().replace(/[:.]/g, "-");

        const fileName = `ticket-user-${req.user.id}-${safeDate}.json`;

        const uploadResult = await uploadJsonToDropbox({
            fileName,
            jsonData: ticketPayload
        });

        res.json({
            message: "Support ticket created and uploaded",
            fileName,
            dropboxFile: uploadResult
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error while creating support ticket"
        });
    }
});

export default router;