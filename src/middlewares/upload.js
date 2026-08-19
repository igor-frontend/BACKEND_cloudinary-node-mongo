const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "backend_proyect_images",
        allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"]
    }
});

const upload = multer({ storage: storage });
const deleteCloudinaryFile = async (url) => {
    if (!url) return;
    try {
        const splits = url.split("/");
        const fileNameWithExtension = splits[splits.length - 1];
        const [publicId] = fileNameWithExtension.split(".");
        const folderName = splits[splits.length - 2];
        const fullPublicId = `${folderName}/${publicId}`;
        
        await cloudinary.uploader.destroy(fullPublicId);
    } catch (error) {
        console.error("Error al eliminar archivo en Cloudinary:", error);
    }
};

module.exports = { upload, deleteCloudinaryFile };