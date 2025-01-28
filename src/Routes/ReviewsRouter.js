import {
    createReview,
    deleteReview,
    deleteReviewAdmin,
    getReviews,
    getReviewStats,
    updateReview
} from "../Controllers/ReviewsController";
import { protect, restrictTo } from "../Middleware/AuthMiddleware";

router.use(protect);

router.route('/')
    .post(createReview)
    .get(getReviews);

router.route('/:id')
    .patch(updateReview)
    .delete(deleteReview);

router.use(restrictTo('admin'));

router.get('/stats', getReviewStats);
router.delete('/:id/admin', deleteReviewAdmin);