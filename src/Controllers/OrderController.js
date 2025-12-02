const Order = require('../Models/Order');
const Product = require('../Models/Products');
const Seminar = require('../Models/Seminar');
const factory = require('./handlerFactory');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');

// --- LÓGICA DE NEGOCIO ---

// 1. Crear Orden (El Cerebro del Checkout)
exports.createOrder = catchAsync(async (req, res, next) => {
    const { items, shippingAddress, paymentMethod } = req.body;
    const orderItems = [];
    let totalAmount = 0;

    // A. Validar y construir los items con datos del Backend (No confiar en el Front)
    for (const item of items) {
        let productDB;
        let itemModel;

        // Identificar si es Producto o Seminario
        if (item.type === 'Product') {
            productDB = await Product.findById(item.id);
            itemModel = 'Products';
        } else if (item.type === 'Seminar') {
            productDB = await Seminar.findById(item.id);
            itemModel = 'Seminar';
        }

        if (!productDB) {
            return next(new AppError(`El ítem con ID ${item.id} no existe.`, 404));
        }

        // B. Validar Stock / Cupos
        if (itemModel === 'Products' && productDB.inventory.isTracked) {
            if (productDB.inventory.stock < item.quantity) {
                return next(new AppError(`Stock insuficiente para ${productDB.name}.`, 400));
            }
        } else if (itemModel === 'Seminar') {
            // Lógica para seminarios (cupos)
            if (productDB.capacity.max - productDB.capacity.current < item.quantity) {
                return next(new AppError(`Cupos agotados para el seminario ${productDB.title}.`, 400));
            }
        }

        // C. Calcular precio real
        const price = itemModel === 'Products' 
            ? (productDB.pricing.salePrice || productDB.pricing.basePrice)
            : (productDB.pricing.discountPrice || productDB.pricing.amount);

        // D. Agregar al array final de la orden
        orderItems.push({
            item: productDB._id,
            itemModel: itemModel,
            quantity: item.quantity,
            priceAtPurchase: price, // SNAPSHOT: Precio congelado
            nameSnapshot: productDB.name || productDB.title
        });

        totalAmount += price * item.quantity;
    }

    // E. Crear la Orden (Estado 'pending' hasta que paguen)
    const newOrder = await Order.create({
        buyer: req.user.id,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentInfo: {
            provider: paymentMethod || 'manual',
            status: 'pending'
        }
    });

    // AQUÍ: Integración futura con Stripe/MercadoPago para generar el link de pago
    // const preference = await mercadoPagoService.createPreference(newOrder);

    res.status(201).json({
        status: 'success',
        data: { order: newOrder }
    });
});

// 2. Webhook de Pago (Cuando MercadoPago avisa que pagaron)
exports.webhookPayment = catchAsync(async (req, res, next) => {
    // Supongamos que recibimos el ID de la orden y el estado 'approved'
    const { orderId, status } = req.body; // Esto depende de la pasarela

    if (status === 'approved') {
        const order = await Order.findById(orderId);
        if (!order) return next(new AppError('Orden no encontrada', 404));

        // ACTUALIZAR STOCK (Solo cuando el pago es exitoso)
        for (const entry of order.items) {
            if (entry.itemModel === 'Products') {
                await Product.findByIdAndUpdate(entry.item, {
                    $inc: { 
                        'inventory.stock': -entry.quantity, 
                        'salesCount': entry.quantity 
                    }
                });
            } else if (entry.itemModel === 'Seminar') {
                await Seminar.findByIdAndUpdate(entry.item, {
                    $inc: { 'capacity.current': entry.quantity }
                });
            }
        }

        order.status = 'paid';
        order.paymentInfo.status = 'approved';
        await order.save();
    }

    res.status(200).send('OK');
});

// 3. Mis Órdenes (Historial del Cliente)
exports.getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ buyer: req.user.id })
        .populate({
            path: 'items.item',
            select: 'name title images coverImage' // Solo traemos info visual básica
        })
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: { orders }
    });
});

// --- ADMIN CRUD (Factory) ---

exports.getAllOrders = factory.getAll(Order);
exports.getOrder = factory.getOne(Order, { path: 'items.item' });
exports.updateOrder = factory.updateOne(Order); // Para cambiar estado manual (ej: 'shipped')
exports.deleteOrder = factory.deleteOne(Order);