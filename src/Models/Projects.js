const mongoose = require('mongoose');
const { stringRequired, commonSchemaOptions, slugify } = require('../Utils/mongooseUtils');

const projectsSchema = new mongoose.Schema({
    title: stringRequired('El título', 100),
    slug: { type: String, unique: true, index: true }, // SEO URL
    
    // Soporte unificado para portada (puede ser img o video poster)
    mainImage: {
        public_id: String,
        url: { type: String, required: [true, 'La imagen principal es requerida'] },
        format: String
    },

    // Galería mixta: Fotos, Videos y 3D (.glb)
    media: [{
        type: {
            type: String,
            enum: ['image', 'video', '3d'], // Agregamos soporte explícito 3D
            default: 'image'
        },
        url: { type: String, required: true },
        public_id: String,
        format: String
    }],

    description: {
        client: stringRequired('Cliente', 50),
        techniques: [String], // Array simple es mejor para búsquedas
        bodyPart: String, // Ej: "Espalda completa"
        duration: {
            sessions: { type: Number, min: 1 },
            hoursTotal: { type: Number, min: 1 } // Simplificado
        },
        story: stringRequired('Historia del proyecto', 2000) // Más espacio para contar la historia
    },
    
    isFeatured: { type: Boolean, default: false, index: true }, // Para filtrar rápidos en el Home
    active: { type: Boolean, default: true, index: true },
    
    // Contadores para evitar queries pesadas de conteo
    stats: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 }
    }
}, commonSchemaOptions);

// Middleware Pre-Save: Generar Slug Automáticamente
projectsSchema.pre('save', function() {
    if (!this.isModified('title')) return ;
    this.slug = slugify(this.title);
    ;
});

// Índice de texto para el buscador interno
projectsSchema.index({ title: 'text', 'description.story': 'text', 'description.techniques': 'text' });

const Projects = mongoose.model('Projects', projectsSchema);
module.exports = Projects;