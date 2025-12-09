const mongoose = require('mongoose');
const { stringRequired, commonSchemaOptions, slugify } = require('../Utils/mongooseUtils');

const galleryArtSchema = new mongoose.Schema({
  title: stringRequired('El título', 100),
  slug: { type: String, unique: true, index: true },
  
  // Tipo de visualización: Define qué componente usará el front
  displayMode: {
      type: String,
      enum: ['parallax-card', '3d-model', 'simple-image'], 
      default: 'parallax-card'
  },

  // ESTRUCTURA EXACTA PARA TU <CardTattoo />
  images: {
    main: { // La imagen superior (animada)
      url: { type: String, required: true },
      public_id: String
    },
    secondary: { // La imagen intermedia (fija)
      url: { type: String, default: '' }, // Opcional si es simple
      public_id: String
    },
    background: { // El fondo con máscara
      url: { type: String, required: true },
      public_id: String
    }
  },

  // TEXTOS FLOTANTES
  content: {
    subtitles: {
      left: { type: String, default: '' },
      right: { type: String, default: '' }
    },    
    taglines: {
      left: { type: String, default: 'TATTOO' },
      right: { type: String, default: 'ART' }
    }
  },

  // ESTILOS DINÁMICOS
  styling: {
    maskType: {
      type: String,
      enum: ['radial', 'linear'],
      default: 'radial'
    },
    shadowIntensity: {
      type: Number,
      min: 0,
      max: 50,
      default: 10
    }
  },

  // Metadatos extra (Categoría, orden, etc.)
  category: {
    type: String,
    enum: ['Black & Gray', 'Realismo'],
    index: true
  },
  
  isFeatured: { type: Boolean, default: false },
  active: { type: Boolean, default: true }

}, commonSchemaOptions);

galleryArtSchema.pre('save', function() {
    if (this.isModified('title')) {
        this.slug = slugify(this.title);
    }
    ;
});

const GalleryArt = mongoose.model('GalleryArt', galleryArtSchema);
module.exports = GalleryArt;