import { catchAsync } from '../Utils/catchAsync';
import Review from '../Models/Reviews';
import { AppError } from '../Utils/AppError';


const checkExistingReview = async (userId, targetId, targetModel) => {
  const existingReview = await Review.findOne({
    author: userId,
    target: targetId,
    targetModel
  });

  if (existingReview) {
    throw new AppError('Ya has realizado una review para este elemento', 400);
  }
};

export const createReview = catchAsync(async (req, res, next) => {
  await checkExistingReview(req.user.id, req.body.target, req.body.targetModel);

  const newReview = await Review.create({
    author: req.user.id,
    content: {
      rating: req.body.rating,
      comment: req.body.comment
    },
    target: req.body.target,
    targetModel: req.body.targetModel
  });

  await newReview.populate('author', 'fullName image');

  res.status(201).json({
    status: 'success',
    data: { review: newReview }
  });
});

export const getReviews = catchAsync(async (req, res) => {
  const filter = {};

  if (req.params.targetId) {
    filter.target = req.params.targetId;
  }
  if (req.query.targetModel) {
    filter.targetModel = req.query.targetModel;
  }

  const reviews = await Review.find(filter)
    .populate('author', 'fullName image')
    .sort('-createdAt');

  // Calcular el promedio de ratings
  const stats = await Review.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$content.rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || { avgRating: 0, numReviews: 0 },
      reviews
    }
  });
});

export const updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOne({
    _id: req.params.id,
    author: req.user.id
  });

  if (!review) {
    return next(new AppError('No se encontró la review o no tienes permiso para editarla', 404));
  }

  const allowedUpdates = ['rating', 'comment'];
  const updates = Object.keys(req.body);
  
  updates.forEach(update => {
    if (allowedUpdates.includes(update)) {
      review.content[update] = req.body[update];
    }
  });

  await review.save();
  await review.populate('author', 'fullName image');

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOne({
    _id: req.params.id,
    author: req.user.id
  });

  if (!review) {
    return next(new AppError('No se encontró la review o no tienes permiso para eliminarla', 404));
  }

  await review.remove();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Admin Controllers
export const getAllReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find()
    .populate('author', 'fullName email')
    .populate('target')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});

export const deleteReviewAdmin = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No se encontró la review', 404));
  }

  await review.remove();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Estadísticas
export const getReviewStats = catchAsync(async (req, res) => {
  const stats = await Review.aggregate([
    {
      $group: {
        _id: '$targetModel',
        avgRating: { $avg: '$content.rating' },
        numReviews: { $sum: 1 },
        ratings: {
          $push: '$content.rating'
        }
      }
    },
    {
      $addFields: {
        ratingDistribution: {
          5: {
            $size: {
              $filter: {
                input: '$ratings',
                as: 'rating',
                cond: { $eq: ['$$rating', 5] }
              }
            }
          },
          4: {
            $size: {
              $filter: {
                input: '$ratings',
                as: 'rating',
                cond: { $eq: ['$$rating', 4] }
              }
            }
          },
          3: {
            $size: {
              $filter: {
                input: '$ratings',
                as: 'rating',
                cond: { $eq: ['$$rating', 3] }
              }
            }
          },
          2: {
            $size: {
              $filter: {
                input: '$ratings',
                as: 'rating',
                cond: { $eq: ['$$rating', 2] }
              }
            }
          },
          1: {
            $size: {
              $filter: {
                input: '$ratings',
                as: 'rating',
                cond: { $eq: ['$$rating', 1] }
              }
            }
          }
        }
      }
    },
    {
      $project: {
        ratings: 0
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});