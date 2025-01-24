const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },    
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
  }, {
    timestamps: true,
    toJSON: { virtuals: true }
  });

const Products = mongoose.model('Products', productSchema);

module.exports = Products;        