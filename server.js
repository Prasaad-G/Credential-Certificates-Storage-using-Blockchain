const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Set up storage using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// In-memory storage for demo purposes
const photoStorage = {};

// Route for uploading photos
app.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        console.error('No file uploaded.');
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const hash = crypto.createHash('sha256').update(req.file.filename).digest('hex');
    
    // Store the hash and file path
    photoStorage[hash] = path.join(__dirname, 'uploads', req.file.filename);
    console.log(`File uploaded: ${req.file.filename}, Hash: ${hash}`);

    res.json({ success: true, hash });
});

// Route for retrieving photos by hash
app.get('/retrieve/:hash', (req, res) => {
    const hash = req.params.hash;
    const filePath = photoStorage[hash];

    if (filePath) {
        res.json({ success: true, photoUrl: filePath });
    } else {
        res.status(404).json({ success: false, message: 'Photo not found' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
