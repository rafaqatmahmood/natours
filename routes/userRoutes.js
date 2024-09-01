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
  getProfile,
  deleteProfile,
} = require('../controllers/userController');

router.post('/signup', signup);
router.post('/login', login);

router.post('/verify-email/:token', verifyEmail);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.patch('/update-password', protect, updatePassword);

router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteProfile);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
