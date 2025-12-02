const Order = require('../Models/Order');
const factory = require('./handlerFactory');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');

// Crear Orden (Checkout)
exports.createOrder = catchAsync(async (req, res, next) => {
    // 1. Asignar el comprador automáticamente desde el JWT
    req.body.buyer = req.user.id;
    
    // Aquí iría la lógica de validación de stock antes de crear (pendiente para ProductsController)
    
    const newOrder = await Order.create(req.body);

    // TODO: Integrar aquí la creación de preferencia de pago (Stripe/MercadoPago)
    // const paymentIntent = await paymentService.createIntent(newOrder);

    res.status(201).json({
        status: 'success',
        data: { order: newOrder }
    });
});

// Obtener mis órdenes (Cliente)
exports.getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ buyer: req.user.id }).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: { orders }
    });
});

// Webhook para pagos (Ejemplo genérico)
exports.webhookPayment = catchAsync(async (req, res, next) => {
    // Aquí recibes la notificación de MercadoPago/Stripe
    // Actualizas el status de la orden a 'paid'
    // Y si es un producto físico, restas el stock en Products
    res.status(200).send('OK');
});

// Admin: Gestión total
exports.getAllOrders = factory.getAll(Order);
exports.getOrder = factory.getOne(Order, { path: 'items.item' }); // Popular detalles del producto
exports.updateOrder = factory.updateOne(Order); // Para cambiar status a 'shipped'
exports.deleteOrder = factory.deleteOne(Order);