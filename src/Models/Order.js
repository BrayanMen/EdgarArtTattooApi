const mongoose = require('mongoose');
const { commonSchemaOptions, numberRequired } = require('../Utils/mongooseUtils');

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Array polimórfico: Puede contener Productos o Seminarios
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'items.itemModel' // Referencia dinámica
        },
        itemModel: {
            type: String,
            required: true,
            enum: ['Products', 'Seminar']
        },
        quantity: { type: Number, default: 1 },
        priceAtPurchase: Number, // Importante: Guardar el precio al momento de la compra (snapshot)
        nameSnapshot: String     // Guardar el nombre por si el producto se borra después
    }],

    totalAmount: numberRequired('El monto total'),
    
    status: {
        type: String,
        enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
        index: true
    },

    paymentInfo: {
        provider: { type: String, enum: ['stripe', 'mercadopago', 'paypal', 'manual'], default: 'manual' },
        transactionId: String,
        status: String
    },

    shippingAddress: {
        street: String,
        city: String,
        zip: String,
        country: String,
        notes: String
    },

    // Para productos digitales o seminarios
    isDigital: { type: Boolean, default: false }

}, commonSchemaOptions);

// Middleware para poblar datos  en consultas
orderSchema.pre(/^find/, function() {
    this.populate('buyer', 'fullName email image');
});

orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;