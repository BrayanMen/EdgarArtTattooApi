const mongoose = require('mongoose');
const { stringRequired, commonSchemaOptions } = require('../Utils/mongooseUtils');

const productSchema = new mongoose.Schema({
    name: stringRequired('El nombre', 100),    
    description: {
      short: { type: String, maxlength: 160 },
      full: String,
      specifications: mongoose.Schema.Types.Mixed
    },
    pricing: {
      basePrice: { type: Number, required: true },      
      mercadoLibreId: String
    },
    inventory: {
      stock: { type: Number, required: true },
      variants: [{
        size: String,
        color: String,
        stock: Number
      }]
    },
    media: {
      images: [String],
      videos: [String]
    },
    salesData: {
      totalSold: { type: Number, default: 0 },
      lastSold: Date
    }
  }, commonSchemaOptions);

const Products = mongoose.model('Products', productSchema);

module.exports = Products;        