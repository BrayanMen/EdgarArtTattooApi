const GalleryArt = require('../Models/GalleryArt');
const factory = require('./handlerFactory');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');

// Middleware para inyectar filtros predefinidos (Ej: ?category=tattoo)
exports.aliasTopTattoos = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-isFeatured';
    next();
};

// 1. Crear Item (Lógica especial por las imágenes anidadas)
exports.createItem = catchAsync(async (req, res, next) => {
    // El middleware 'processGalleryMedia' ya puso las imágenes en req.body.images
    // Mongoose se encarga de validar el resto
    const newItem = await GalleryArt.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: newItem
        }
    });
});

// 2. Obtener galería por tipo (útil para filtrar en el front)
exports.getGalleryByType = catchAsync(async (req, res, next) => {
    const { type } = req.params; // 'Tattoo', '3D', 'Sketch'
    const gallery = await GalleryArt.find({ type, active: true });

    res.status(200).json({
        status: 'success',
        results: gallery.length,
        data: { data: gallery }
    });
});

// Usamos el Factory para lo estándar
exports.getAllGallery = factory.getAll(GalleryArt);
exports.getGalleryItem = factory.getOne(GalleryArt);
exports.updateGalleryItem = factory.updateOne(GalleryArt);
exports.deleteGalleryItem = factory.deleteOne(GalleryArt);