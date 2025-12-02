const mongoose = require('mongoose');
const { stringRequired } = require('../Utils/mongooseUtils');

const ReviewsSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Contenido validado
    content: {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        comment: stringRequired('El comentario', 1000)
    },
    // Referencia dinámica (Polimorfismo)
    target: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetModel' // Magia de Mongoose para poblar dinámicamente
    },
    targetModel: {
        type: String,
        required: true,
        enum: ['Projects', 'Products', 'GalleryArt', 'Seminar'] // Agregamos Seminar
    },
    
    isApproved: { type: Boolean, default: true } // Moderación automática (opcional)

}, { timestamps: true });

// ÍNDICE COMPUESTO (CRÍTICO):
// Permite buscar "todas las reviews del Proyecto X" instantáneamente.
ReviewsSchema.index({ target: 1, targetModel: 1 });

// Evitar spam: Un usuario solo puede dejar 1 review por target
ReviewsSchema.index({ author: 1, target: 1, targetModel: 1 }, { unique: true });

const Reviews = mongoose.model('Reviews', ReviewsSchema);
module.exports = Reviews;