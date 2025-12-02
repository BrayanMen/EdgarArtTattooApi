const mongoose = require('mongoose');
const { commonSchemaOptions } = require('../Utils/mongooseUtils');

const carouselSchema = new mongoose.Schema({
  title: { type: String, trim: true }, // Texto grande (H1)
  subtitle: { type: String, trim: true }, // Texto pequeño
  
  // Soporte híbrido: Imagen o Video de fondo
  media: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
      type: { type: String, enum: ['image', 'video'], default: 'image' }
  },

  // Botón de acción (CTA)
  cta: {
      text: String, // Ej: "Reservar Cita"
      link: String  // Ej: "/booking"
  },

  order: { type: Number, default: 0 }, // Para controlar cuál sale primero
  active: { type: Boolean, default: true }
}, commonSchemaOptions);

const Carousel = mongoose.model('Carousel', carouselSchema);
module.exports = Carousel;