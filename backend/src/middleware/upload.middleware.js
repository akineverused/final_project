import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "inventories",
        allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"]
    }
});

const upload = multer({ storage });

export async function deleteImageFromCloud(url) {
    const publicId = url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);
}

export default upload;