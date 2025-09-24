const express = require('express');
const router = express.Router();
const controller = require('../controllers/OrderController');
const verifyRole = require('../middleware/auth').verifyRole;

router.get('/orders', verifyRole(['admin']), controller.getOrders);
router.post('/createorder', verifyRole(['admin', 'user']), controller.addOrder);
router.post('/updateorder', verifyRole(['admin']), controller.updateOrder);
router.post('/deleteorder', verifyRole(['admin']), controller.deleteOrder);

module.exports =router;