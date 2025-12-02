const GalleryArt = require('../Models/GalleryArt');
const factory = require('./handlerFactory');
const catchAsync = require('../Utils/catchAsync');

// --- MIDDLEWARES DE FILTRADO ---

// Para el Home: "Top 5 destacados"
exports.aliasTopGallery = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-isFeatured -createdAt';
    req.query.active = 'true';
    next();
};

// --- LÓGICA DE NEGOCIO ---

// 1. Crear Item de Galería
// Maneja la estructura compleja de imágenes que requiere tu componente React
exports.createGalleryItem = catchAsync(async (req, res, next) => {
    // El middleware 'processGalleryMedia' ya organizó las imágenes en req.body.images
    // Mongoose validará que la estructura coincida con el modelo
    const newItem = await GalleryArt.create(req.body);

    res.status(201).json({
        status: 'success',
        data: { data: newItem },
    });
});

// 2. Obtener por Tipo (Tatuaje, 3D, Boceto)
exports.getGalleryByType = catchAsync(async (req, res, next) => {
    const { type } = req.params; // Ej: '3D Model' o 'Tattoo'

    const gallery = await GalleryArt.find({
        type: type,
        active: true,
    }).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: gallery.length,
        data: { data: gallery },
    });
});

exports.getAllGallery = factory.getAll(GalleryArt);
exports.getGalleryItem = factory.getOne(GalleryArt);
exports.updateGalleryItem = factory.updateOne(GalleryArt);
exports.deleteGalleryItem = factory.deleteOne(GalleryArt);
