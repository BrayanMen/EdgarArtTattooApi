const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name_product: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        require: true,
    },
    category: {        
            type: String,
            required: true,
            enum: [
                "ilustracion",
                "pintura",
                "print",
                "sticker",
                "indumentaria"
            ]        
    },
    date:{
        type: Date,
        default: Date.now,
    },
    available:{
        type: Boolean,
        default: true,
    }
},
    {
        timestamps: true,
    }
);

const Products = mongoose.model('Products', ProductsSchema);

module.exports = Products;