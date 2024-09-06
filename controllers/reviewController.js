const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.params.tourId) filter.tour = req.params.tourId;

  const reviews = await Review.find(filter);

  res.status(200).json({ status: 'success', data: { reviews } });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;

  const review = new Review(req.body);

  await review.save();

  res.status(201).json({ status: 'success', data: { review } });
});
