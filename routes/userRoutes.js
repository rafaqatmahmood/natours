const router = require('express').Router();
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  verifyEmail,
} = require('../controllers/authController');
const {
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  createUser,
  updateProfile,
  deleteProfile,
  getMe,
} = require('../controllers/userController');

router.post('/signup', signup);
router.post('/login', login);

router.post('/verify-email/:token', verifyEmail);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.patch('/update-password', protect, updatePassword);

router.get('/me', protect, getMe, getUser);
router.patch('/updateMe', protect, updateProfile);
router.delete('/deleteMe', protect, deleteProfile);

router.route('/').get(getAllUsers).post(createUser);
router
  .route('/:id')
  .get(protect, getUser)
  .patch(protect, updateUser)
  .delete(protect, deleteUser);

module.exports = router;
