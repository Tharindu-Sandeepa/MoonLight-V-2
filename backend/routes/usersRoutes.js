const express = require('express');
const router = express.Router();
const controller = require('../controllers/UsersController');
const verifyRole = require('../middleware/auth').verifyRole;

router.get('/users', controller.getUsers);
router.post('/createuser', verifyRole(['admin', 'user']), controller.addUser);
router.post('/updateuser', verifyRole(['admin', 'user']), controller.updateUser);
router.post('/deleteuser', verifyRole(['admin', 'user']), controller.deleteUser);

router.post('/update-password', verifyRole(['admin', 'user']), controller.changepassword);

module.exports =router;