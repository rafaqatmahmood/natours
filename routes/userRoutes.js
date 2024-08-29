const router = require('express').Router();
const { signup, login } = require('../controllers/authController');
const {
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  createUser,
} = require('../controllers/userController');

router.post('/signup', signup);
router.post('/login', login);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
