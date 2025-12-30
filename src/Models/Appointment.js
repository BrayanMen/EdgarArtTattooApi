const mongoose = require('mongoose');
const { stringRequired, commonSchemaOptions } = require('../Utils/mongooseUtils');

const appointmentSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Detalles del Tatuaje
    description: stringRequired('La idea del tatuaje', 1000),
    bodyPart: {
        type: String,
        required: [true, 'La zona del cuerpo es requerida'],
        trim: true
    },
    size: String, // Ej: "15x15 cm"
    
    // Imágenes de referencia (Inspiración)
    referenceImages: [{
        url: String,
        public_id: String
    }],

    // Estado del flujo de venta
    status: {
        type: String,
        enum: ['requested', 'reviewed', 'quoted', 'scheduled', 'completed', 'rejected'],
        default: 'requested',
        index: true
    },

    // Cotización (Solo visible para admin y el cliente dueño)
    quote: {
        price: Number,
        estimatedSessions: Number,
        depositAmount: Number // Seña requerida
    },

    // Agendamiento (Si ya se concretó)
    scheduledDate: Date,

    adminNotes: { type: String, select: false } // Notas internas privadas para Edgar

}, commonSchemaOptions);

appointmentSchema.index({ client: 1, status: 1 });
appointmentSchema.index({ status: 1, scheduledDate: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;