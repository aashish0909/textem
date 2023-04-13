const {
  register,
  login,
  setAvatar,
  getAllUsers,
  updateUserStatus,
  logOut,
  getuser,
  getFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  sendFriendRequest,
  getFriendRequests,
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = require('express').Router();

router.post('/register', register);
router.post('/login', login);
router.post('/setAvatar', authMiddleware, setAvatar);
router.get('/getUser', authMiddleware, getuser);
router.get('/allUsers', authMiddleware, getAllUsers);
router.post('/updateUserStatus', updateUserStatus);
router.get('/logout', authMiddleware, logOut);

router.post('/sendfriendrequest', authMiddleware, sendFriendRequest);
router.get('/getfriendrequests', authMiddleware, getFriendRequests);
router.get('/getfriendrequest/', authMiddleware, getFriendRequest);
router.post('/acceptfriendrequest', authMiddleware, acceptFriendRequest);
router.post('/rejectfriendrequest', authMiddleware, rejectFriendRequest);
router.post('/unfriend', authMiddleware, unfriend);

module.exports = router;
