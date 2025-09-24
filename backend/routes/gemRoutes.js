const express = require('express');  
const router = express.Router();
const controller = require('../controllers/gemController');
const verifyRole = require('../middleware/auth').verifyRole;

router.get('/gems', controller.getGem);
router.post('/addGem',verifyRole(['admin']), controller.addGem);
router.post('/updateGem', verifyRole(['admin']), controller.updateGem);
router.post('/deleteGem', verifyRole(['admin']), controller.deleteGem);


module.exports = router;