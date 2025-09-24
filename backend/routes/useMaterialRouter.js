const express = require('express');
const router = express.Router();
const useController = require('../controllers/useMaterialController');
const verifyRole = require('../middleware/auth').verifyRole;

router.get('/usematerials' , useController.getusemat);
router.post('/addusematerial' , verifyRole(['admin', 'user']), useController.addusemat);
router.post('/updateusematerial' , verifyRole(['admin', 'user']), useController.updateusemat);
router.post('/deleteusematerial' , verifyRole(['admin', 'user']), useController.deleteusemat);

module.exports= router;