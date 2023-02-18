const {
  addMessage,
  getAllMessages,
} = require('../controllers/messagesController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = require('express').Router();

router.post('/addmsg/', authMiddleware, addMessage);
router.post('/getmsg/', authMiddleware, getAllMessages);

module.exports = router;
