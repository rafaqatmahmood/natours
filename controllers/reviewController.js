const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({ status: 'success', data: { reviews } });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const review = new Review({ ...(req.body || {}), user: req.user._id });

  await review.save();

  res.status(201).json({ status: 'success', data: { review } });
});
