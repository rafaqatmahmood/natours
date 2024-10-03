const router = require('express').Router();
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  verifyEmail,
  restrictTo,
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

router.use(protect);

router.patch('/update-password', updatePassword);

router.get('/me', getMe, getUser);
router.patch('/updateMe', updateProfile);
router.delete('/deleteMe', deleteProfile);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router
  .route('/:id')
  .get(protect, getUser)
  .patch(protect, updateUser)
  .delete(protect, deleteUser);

module.exports = router;
