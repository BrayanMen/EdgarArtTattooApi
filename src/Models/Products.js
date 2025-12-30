const mongoose = require('mongoose');
const { stringRequired, numberRequired, commonSchemaOptions, slugify } = require('../Utils/mongooseUtils');

const productSchema = new mongoose.Schema({
    name: stringRequired('El nombre del producto', 150),
    slug: { type: String, unique: true, index: true },
    
    category: { 
        type: String, 
        required: true, 
        index: true, 
        enum: ['Cuidado', 'Ropa', 'Arte', 'Accesorios', 'Digital'] // Categorías fijas ayudan al orden
    },

    description: {
      short: { type: String, maxlength: 160 }, // Meta description para SEO
      full: String // HTML permitido
    },

    pricing: {
      basePrice: numberRequired('Precio base'),
      salePrice: Number, // Precio de oferta
      mercadoLibreId: { type: String, select: false } // Oculto por defecto
    },

    inventory: {
      sku: { type: String, unique: true, sparse: true }, // Stock Keeping Unit
      stock: { type: Number, default: 0, min: 0 },
      isTracked: { type: Boolean, default: true } // Para productos digitales (sin stock)
    },

    images: [{
        url: String,
        public_id: String
    }],

    // Analíticas integradas
    salesCount: { type: Number, default: 0, index: -1 } // Para ordenar por "Más vendidos"

}, commonSchemaOptions);

productSchema.pre('save', function() {
    if (this.isModified('name')) {
        this.slug = slugify(this.name);
    }
});

productSchema.index({ name: 'text', 'description.full': 'text' });
productSchema.index({ category: 1, salesCount: -1 });

const Products = mongoose.model('Products', productSchema);
module.exports = Products;