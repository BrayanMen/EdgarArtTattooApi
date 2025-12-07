const express = require('express');
const router = express.Router({ mergeParams: true }); // Permite recibir params de otros routers si se anidan
const reviewController = require('../Controllers/ReviewsController');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

// --- Públicas ---
// Obtener reviews generales o filtradas por query string (?target=...)
router.get('/', reviewController.getReviews);
router.get('/target/:targetId', reviewController.getReviews); // Reviews específicas de un item

// --- Usuarios Logueados ---
router.use(protect);

router.post('/', reviewController.createReview); // Dejar una review

router.route('/:id')
    .patch(reviewController.updateReview) // Editar mi propia review
    .delete(reviewController.deleteReview); // Borrar mi propia review

// --- Admin ---
router.use(restrictTo('admin'));

router.get('/admin/all', reviewController.getAllReviews); // Ver todo sin filtros
router.get('/admin/stats', reviewController.getReviewStats); // Analíticas
router.delete('/admin/:id', reviewController.deleteReviewAdmin); // Moderación (Borrar review ajena)

module.exports = router;