const express = require('express');
const router = express.Router();
const { uploadGalleryFields, processGalleryMedia } = require('../Middleware/uploadMiddleware');
const { protect, restrictTo } = require('../Middleware/authMiddleware');
const { 
    createGalleryItem, 
    getAllGallery, 
    getGalleryByType, 
    deleteGalleryItem, 
    updateGalleryItem,
    aliasTopGallery 
} = require('../Controllers/GalleryController');

// Públicas
router.get('/', getAllGallery);
router.get('/top-5', aliasTopGallery, getAllGallery); // Shortcut para el Home
router.get('/type/:type', getGalleryByType); // Filtrar: /api/gallery/type/3D Model

// Admin
router.use(protect, restrictTo('admin'));

// La ruta mágica con subida múltiple
router.post('/', 
    uploadGalleryFields, 
    processGalleryMedia, 
    createGalleryItem
);

router.route('/:id')
    .patch(updateGalleryItem)
    .delete(deleteGalleryItem);

module.exports = router;