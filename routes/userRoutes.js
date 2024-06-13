const router = require("express").Router();
const {
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  createUser,
} = require("../controllers/userController");

router.route("/api/v1/users").get(getAllUsers).post(createUser);
router
  .route("/api/v1/users/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
