const express = require('express');
const suproute = express.Router();
const supOrdController = require('../controllers/supOrdController')
const verifyRole = require('../middleware/auth').verifyRole;

suproute.get('/supOrders',supOrdController.getOrders);
suproute.post('/createsupOrder',verifyRole(['admin', 'user']), supOrdController.addsupOrder);
suproute.post('/updatesupOrder',verifyRole(['admin', 'user']), supOrdController.updatesupOrder);
suproute.post('/deletesupOrder',verifyRole(['admin', 'user']), supOrdController.deletesupOrder);

module.exports = suproute;
