const express = require('express');
const router = express.Router();
const {
    getAllSeminars,
    createSeminar,
    getSeminar,
    updateSeminar,
    deleteSeminar,
    getActiveSeminars,
} = require('../Controllers/SeminarController');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

// Públicas
router.get('/', getAllSeminars); // Devuelve todos (o podrías usar getActiveSeminars como default)
router.get('/active', getActiveSeminars); // Solo los futuros
router.get('/:id', getSeminar);

// Admin
router.use(protect, restrictTo('admin'));

router.post('/', createSeminar);
router.route('/:id').patch(updateSeminar).delete(deleteSeminar);

module.exports = router;
