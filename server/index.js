const express = require('express');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const { storage } = require('./cloudinaryConfig'); // Import Cloudinary storage

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({ 
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com', 'https://www.yourdomain.com'] // Replace with your actual domain
        : ['http://localhost:5000', 'http://localhost:3000'],
    credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Session for admin login
app.use(session({
    secret: 'your-strong-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// --- Multer Setup for Cloudinary ---
const upload = multer({ storage: storage });

// --- In-memory Data Store ---
let houses = [];
let nextId = 1;

// --- API Routes ---

// Auth Routes
app.get('/api/check-auth', (req, res) => {
    res.json({ isAdmin: !!req.session.isAdmin });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Securely get credentials from environment variables with defaults
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUsername && password === adminPassword) {
        req.session.isAdmin = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Image Upload Route
app.post('/api/upload', upload.array('images', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded.' });
    }
    const imageUrls = req.files.map(file => file.path); // Returns the Cloudinary URLs
    res.json({ success: true, imageUrls });
});

// House CRUD Routes
app.get('/api/houses', (req, res) => {
    res.json(houses);
});

app.get('/api/houses/:id', (req, res) => {
    const house = houses.find(h => h.id === parseInt(req.params.id));
    if (!house) {
        return res.status(404).json({ error: 'House not found' });
    }
    res.json(house);
});

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

app.put('/api/houses/:id', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Admin access required' });
    }
    const houseIndex = houses.findIndex(h => h.id === parseInt(req.params.id));
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

app.delete('/api/houses/:id', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Admin access required' });
    }
    const index = houses.findIndex(h => h.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'House not found' });
    }
    houses.splice(index, 1);
    res.json({ message: 'House deleted successfully' });
});

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

// --- Server Startup ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;