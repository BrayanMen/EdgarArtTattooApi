const mongoose = require('mongoose');
const { stringRequired, numberRequired, commonSchemaOptions, slugify } = require('../Utils/mongooseUtils');

const seminarSchema = new mongoose.Schema({
    title: stringRequired('El título del seminario', 150),
    slug: { type: String, unique: true, index: true },
    
    description: stringRequired('La descripción', 5000), // HTML o Markdown largo
    
    coverImage: {
        url: String,
        public_id: String
    },
    
    modality: {
        type: String,
        enum: ['Online', 'Presencial', 'Masterclass Grabada'],
        required: true
    },
    
    // Fechas clave
    dates: {
        start: { type: Date, required: true, index: true }, // Indexar por fecha es vital para mostrar "Próximos eventos"
        end: Date
    },
    
    pricing: {
        amount: numberRequired('El precio'),
        currency: { type: String, default: 'USD' },
        discountPrice: Number // Para ofertas "Early Bird"
    },
    
    capacity: {
        max: { type: Number, default: 20 },
        current: { type: Number, default: 0 } // Control de cupos
    },
    
    // Recursos para el estudiante (PDFs, links)
    resources: [{
        name: String,
        url: String,
        type: String // 'pdf', 'video', 'link'
    }],

    active: { type: Boolean, default: true }
}, commonSchemaOptions);

seminarSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title);
    }
    next();
});

const Seminar = mongoose.model('Seminar', seminarSchema);
module.exports = Seminar;