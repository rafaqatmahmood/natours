const router = require('express').Router();
const { signup } = require('../controllers/authController');
const {
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  createUser,
} = require('../controllers/userController');

router.route('/signup').post(signup);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
