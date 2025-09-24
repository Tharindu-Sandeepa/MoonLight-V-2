const express = require('express');
const supListRoute = express.Router();
const supListController = require('../controllers/supListController')
const verifyRole = require('../middleware/auth').verifyRole;

supListRoute.get('/supList',supListController.getSupplier);
supListRoute.post('/createsupplier', verifyRole(['admin', 'user']), supListController.addSupplier);
supListRoute.post('/updatesupplier',verifyRole(['admin', 'user']), supListController.updateSupplier);
supListRoute.post('/deletesupplier',verifyRole(['admin', 'user']), supListController.deleteSupplier);

module.exports = supListRoute;
