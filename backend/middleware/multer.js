const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const imagesPath = path.join(__dirname, '../../Frontend/src/images/');

// Define allowed MIME types for images
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent overwrites and traversal
    const ext = path.extname(file.originalname).toLowerCase();
    const safeFileName = `${uuidv4()}${ext}`;
    cb(null, safeFileName);
  }
});

// File filter to validate MIME type
const fileFilter = (req, file, cb) => {
  if (!allowedImageTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
  }
  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;