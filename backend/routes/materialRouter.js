const express = require('express');
const router = express.Router();
const controller = require('../controllers/materialController');
const verifyRole = require('../middleware/auth').verifyRole;

router.get('/materials' , controller.getmat);
router.post('/addmaterial' , verifyRole(['admin', 'user']), controller.addmat);
router.post('/updatematerial' ,verifyRole(['admin', 'user']), controller.updatemat);
router.post('/deletematerial' , verifyRole(['admin', 'user']), controller.deletemat);

module.exports= router;