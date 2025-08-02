const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory storage for houses
let houses = [];
let nextId = 1;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Basic middleware
app.use(cors({ credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for admin login
app.use(session({
    secret: 'simple-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Admin login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === 'admin123') {
        req.session.isAdmin = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Check if admin is logged in
app.get('/api/check-auth', (req, res) => {
    res.json({ isAdmin: !!req.session.isAdmin });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get all houses (public)
app.get('/api/houses', (req, res) => {
    res.json(houses);
});

// Get single house (public)
app.get('/api/houses/:id', (req, res) => {
    const house = houses.find(h => h.id == req.params.id);
    if (!house) {
        return res.status(404).json({ error: 'House not found' });
    }
    res.json(house);
});

// Add new house (admin only)
app.post('/api/houses', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Admin access required' });
    }

    const { title, price, address, description, status = 'available' } = req.body;

    if (!title || !price || !address) {
        return res.status(400).json({ error: 'Title, price, and address are required' });
    }

    const house = {
        id: nextId++,
        title,
        price: Number(price),
        address,
        description: description || '',
        status,
        images: [],
        createdAt: new Date().toISOString()
    };

    houses.push(house);
    res.status(201).json(house);
});

// Update house (admin only)
app.put('/api/houses/:id', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Admin access required' });
    }

    const houseIndex = houses.findIndex(h => h.id == req.params.id);
    if (houseIndex === -1) {
        return res.status(404).json({ error: 'House not found' });
    }

    const { title, price, address, description, status } = req.body;
    houses[houseIndex] = {
        ...houses[houseIndex],
        title: title || houses[houseIndex].title,
        price: price ? Number(price) : houses[houseIndex].price,
        address: address || houses[houseIndex].address,
        description: description || houses[houseIndex].description,
        status: status || houses[houseIndex].status
    };

    res.json(houses[houseIndex]);
});

// Delete house (admin only)
app.delete('/api/houses/:id', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Admin access required' });
    }

    const houseIndex = houses.findIndex(h => h.id == req.params.id);
    if (houseIndex === -1) {
        return res.status(404).json({ error: 'House not found' });
    }

    houses.splice(houseIndex, 1);
    res.json({ message: 'House deleted successfully' });
});

// Upload multiple images (admin only)
app.post('/api/upload', upload.array('images', 10), (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Admin access required' });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ success: true, imageUrls });
});

// Add images to house (admin only)
app.post('/api/houses/:id/images', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Admin access required' });
    }

    const house = houses.find(h => h.id == req.params.id);
    if (!house) {
        return res.status(404).json({ error: 'House not found' });
    }

    const { imageUrls } = req.body;
    if (!imageUrls || !Array.isArray(imageUrls)) {
        return res.status(400).json({ error: 'Image URLs array is required' });
    }

    house.images.push(...imageUrls);
    res.json(house);
});

// Remove image from house (admin only)
app.delete('/api/houses/:id/images/:imageIndex', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Admin access required' });
    }

    const house = houses.find(h => h.id == req.params.id);
    if (!house) {
        return res.status(404).json({ error: 'House not found' });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= house.images.length) {
        return res.status(400).json({ error: 'Invalid image index' });
    }

    house.images.splice(imageIndex, 1);
    res.json(house);
});

// For Vercel deployment
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Open http://localhost:${PORT} in your browser`);
    });
} 