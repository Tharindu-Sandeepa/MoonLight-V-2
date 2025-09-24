const express = require('express');
const router = express.Router();
const controller = require('../controllers/feedbackController');
const verifyRole = require('../middleware/auth').verifyRole;


router.get('/feedbacks',controller.getFeedback);
router.post('/createfeedback', verifyRole(['admin', 'user']), controller.addFeedback);
router.post('/updatefeedback', verifyRole(['admin', 'user']), controller.updateFeedback);
router.post('/deletefeedback',verifyRole(['admin', 'user']), controller.deleteFeedback);

module.exports = router;