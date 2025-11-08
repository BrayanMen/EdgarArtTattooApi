const { Router } = require('express');
const router = Router();
const {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  deleteReviewAdmin,
  getReviewStats
} = require('../Controllers/ReviewsController');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

router.get('/', getReviews);
router.get('/target/:targetId', getReviews);

router.use(protect);

router.post('/', createReview);
router.route('/:id')
  .patch(updateReview)
  .delete(deleteReview);

router.use(restrictTo('admin'));

router.get('/admin/all', getAllReviews);
router.get('/admin/stats', getReviewStats);
router.delete('/admin/:id', deleteReviewAdmin);

module.exports = router;