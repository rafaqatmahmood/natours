const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, getAll, getOne } = require('./handlerFactory');

const filterObj = (obj, ...allowedKeys) => {
  const filteredObj = {};

  Object.keys(obj).forEach(key => {
    if (allowedKeys.includes(key)) {
      filteredObj[key] = obj[key];
    }
  });

  return filteredObj;
};

exports.getAllUsers = getAll(User);

exports.getProfile = catchAsync(async (req, res, next) => {
  res.json({ status: 'success', data: { user: req.user } });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const filteredObj = filterObj(req.body || {}, 'name', 'email');

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route does not allow user to change password', 400),
    );
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.json({ status: 'success', data: { user: updatedUser } });
});

exports.deleteProfile = catchAsync(async (req, res, next) => {
  await User.findOneAndUpdate(req.user._id, { active: false });

  res
    .status(204)
    .json({ status: 'success', message: 'Profile deleted successfully!' });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

exports.getUser = getOne(User);

exports.updateUser = updateOne(User);

exports.deleteUser = deleteOne(User);
