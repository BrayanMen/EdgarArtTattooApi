const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getMyOrders, 
    getOrder, 
    getAllOrders, 
    updateOrder, // Admin cambiar status
    webhookPayment 
} = require('../Controllers/OrderController');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

// Webhook (Pública para que MercadoPago/Stripe pueda llamar)
router.post('/webhook', webhookPayment);

// Rutas Protegidas (Usuario Autenticado)
router.use(protect);

router.post('/', createOrder); // Checkout
router.get('/my-orders', getMyOrders);

// Rutas Admin
router.use(restrictTo('admin'));

router.get('/', getAllOrders);
router.route('/:id')
    .get(getOrder)
    .patch(updateOrder); // Ej: pasar de 'pending' a 'shipped'

module.exports = router;