const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Replace with your actual credentials or use environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dcjp2ltth',
  api_key: process.env.CLOUDINARY_API_KEY || '912589654455233',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'TPYklj3BsG_NlgcDg6biZy8ECM8'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Optional: Cloudinary folder
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
  },
});

module.exports = { cloudinary, storage };