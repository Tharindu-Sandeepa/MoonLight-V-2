const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth').verifyToken;
const authController = require('../controllers/authController');

// Get user details
router.get('/myaccount', verifyToken, authController.getUserDetails);

module.exports = router;
