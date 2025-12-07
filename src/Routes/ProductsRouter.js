const express = require('express');
const router = express.Router();
const { 
    getAllProducts, 
    createProduct, 
    getProduct, 
    updateProduct, 
    deleteProduct, 
    getProductBySlug,
    syncWithMercadoLibre 
} = require('../Controllers/ProductsController');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

// Rutas Públicas (Clientes)
router.get('/', getAllProducts);
router.get('/slug/:slug', getProductBySlug); // SEO Friendly
router.get('/:id', getProduct);

// Rutas Protegidas (Admin)
router.use(protect, restrictTo('admin'));

router.post('/', createProduct);
router.post('/sync-ml/:productId', syncWithMercadoLibre);

router.route('/:id')
    .patch(updateProduct)
    .delete(deleteProduct);

module.exports = router;