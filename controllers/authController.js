const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, res, statusCode) => {
  // Log the user in, send JWT
  const token = signToken(user._id);

  res.status(statusCode).json({ status: 'success', token });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(user, res, 201);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if the email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check user exist and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new AppError('Invalid credentials'));

  const passwordValid = await user.comparePassword(password);
  if (!passwordValid) return next(new AppError('Invalid credentials'));

  // If everything ok, send the token to client
  createSendToken(user, res, 200);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Getting token and check of it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );

  // Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check User exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );

  // Check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('You recently changed password! Please log in again', 401),
    );
  }

  req.user = currentUser;
  // Grant access to the protected route
  next();
});

exports.restrictTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403),
      );
    }

    next();
  });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(200)
      .json({ status: 'success', message: 'Token sent to email!' });
  }

  // Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a new PATCH request with your new password and passwordConfirm to: ${resetURL} \nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Something went wrong while sending the email. Try again later!',
        500,
      ),
    );
  }

  res.status(200).json({ status: 'success', message: 'Token sent to email!' });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get User based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // Log the user in, send JWT
  createSendToken(user, res, 200);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;

  // Get user from collection
  const user = await User.findById(req.user._id).select('+password');

  // Check if posted current password is correct
  if (!(await user.comparePassword(passwordCurrent))) {
    return next(new AppError('Current Password is invalid', 400));
  }

  // If so, update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  // Log the user in, send JWT
  createSendToken(user, res, 200);
});
