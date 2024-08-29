const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
    data: { user },
  });
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
  const token = signToken(user._id);

  res.json({ status: 'success', token });
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
