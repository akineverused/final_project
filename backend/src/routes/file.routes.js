import express from "express";
import upload from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/upload", protect, upload.single("file"), async (req, res) => {

    try {

        res.json({
            url: req.file.path,
            name: req.file.originalname
        });

    } catch (error) {
        res.status(500).json({ message: "Upload failed" });
    }

});

export default router;