const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Check if Cloudinary environment variables are set
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                              process.env.CLOUDINARY_API_KEY && 
                              process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
    // Use only environment variables - no hardcoded credentials
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
} else {
    console.warn('Cloudinary environment variables not set. Image uploads will fail.');
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', // Optional: Cloudinary folder
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    },
});

module.exports = { cloudinary, storage, isCloudinaryConfigured };