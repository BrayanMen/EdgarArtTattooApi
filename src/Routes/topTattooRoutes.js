const express = require('express');
const router = express.Router();
const { 
    addImageAtPosition, 
    toggleActiveImage, 
    reOrder, 
    getAllTopTattoos, 
    deleteTopTattoo 
} = require('../Controllers/TopTattooController');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

// --- Público ---
// El front consume esto para mostrar el carrusel del Top
router.get('/', getAllTopTattoos);

// --- Admin ---
router.use(protect, restrictTo('admin'));

router.post('/', addImageAtPosition); // Crear
router.patch('/reorder', reOrder);    // Reordenar Drag & Drop

router.route('/:id')
    .delete(deleteTopTattoo) // Borrar una imagen del top
    .patch(toggleActiveImage); // Activar/Desactivar sin borrar



module.exports = router;