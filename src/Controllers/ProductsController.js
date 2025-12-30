const Product = require('../Models/Products'); // Asegúrate que el nombre del archivo sea Products.js o Product.js
const factory = require('./handlerFactory');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');
const axios = require('axios'); // Necesario para ML

// --- LÓGICA DE NEGOCIO ---

// 1. Obtener producto por Slug (SEO Friendly para el frontend)
exports.getProductBySlug = catchAsync(async (req, res, next) => {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
        return next(new AppError('No se encontró producto con ese nombre', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { product },
    });
});

// 2. Sincronización con MercadoLibre (Mejorada)
// Se puede llamar manualmente desde un botón en el Dashboard del Admin
exports.syncWithMercadoLibre = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) return next(new AppError('Producto no encontrado', 404));

    if (!product.name || !product.pricing.basePrice || product.images.length === 0) {
    return next(new AppError('Faltan datos obligatorios para ML', 400));
}

    // Validamos que tengamos API Key
    if (!process.env.MERCADOLIBRE_API_KEY) {
        return next(new AppError('API Key de MercadoLibre no configurada', 500));
    }

    // Lógica de mapeo para ML (Simplificada para el ejemplo)
    const mlBody = {
        title: product.name,
        description: product.description.full || product.description.short,
        price: product.pricing.basePrice,
        currency_id: 'COP', // O la moneda que uses
        available_quantity: product.inventory.stock,
        buying_mode: 'buy_it_now',
        listing_type_id: 'gold_special', // Tipo de publicación en ML
        condition: 'new',
        pictures: product.images.map(img => ({ source: img.url })),
    };

    try {
        let response;
        // Si ya tiene ID de ML, actualizamos (PUT), si no, creamos (POST)
        if (product.pricing.mercadoLibreId) {
            response = await axios.put(
                `https://api.mercadolibre.com/items/${product.pricing.mercadoLibreId}`,
                mlBody,
                { headers: { Authorization: `Bearer ${process.env.MERCADOLIBRE_API_KEY}` } }
            );
        } else {
            response = await axios.post('https://api.mercadolibre.com/items', mlBody, {
                headers: { Authorization: `Bearer ${process.env.MERCADOLIBRE_API_KEY}` },
            });
            // Guardamos el ID que nos devuelve ML
            product.pricing.mercadoLibreId = response.data.id;
            await product.save();
        }

        res.status(200).json({
            status: 'success',
            message: 'Sincronización con MercadoLibre exitosa',
            data: { mlData: response.data },
        });
    } catch (error) {
        console.error('Error ML:', error.response?.data || error.message);
        return next(new AppError('Falló la comunicación con MercadoLibre', 502));
    }
});

// 3. Verificación de Stock (Middleware útil para el OrderController)
exports.checkStock = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.body.product);
    if (!product) return next(new AppError('Producto no encontrado', 404));

    if (product.inventory.isTracked && product.inventory.stock < req.body.quantity) {
        return next(
            new AppError(`Stock insuficiente. Solo quedan ${product.inventory.stock}`, 400)
        );
    }
    next(); // Si hay stock, pasa al siguiente middleware (ej: crear orden)
});

// --- CRUD ESTÁNDAR (FACTORY) ---

exports.getAllProducts = factory.getAll(Product);
exports.getProduct = factory.getOne(Product); // Por ID
exports.createProduct = factory.createOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);
