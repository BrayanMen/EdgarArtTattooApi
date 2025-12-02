const express = require('express');
const router = express.Router();
const { uploadGalleryFields, processGalleryMedia } = require('../Middleware/uploadMiddleware');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

const galleryController = require('../Controllers/GalleryController'); // Asumo que crearás este

// POST Crear Item de Galería
router.post('/', 
    protect, 
    restrictTo('admin'),
    uploadGalleryFields, // 1. Multer recibe 3 archivos
    processGalleryMedia, // 2. Cloudinary los sube y los mete en req.body.images
    galleryController.createItem // 3. Mongoose guarda el JSON ya estructurado
);

module.exports = router;