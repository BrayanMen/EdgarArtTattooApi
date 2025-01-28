const mongoose = require('mongoose');

const topTattooSchema = new mongoose.Schema({
    image: {
        type: String,
        required: [true, 'La imagen es requerida'],
    },
    order: {
        type: Number,
        unique: true,
        min: [1, 'El orden mínimo es 1'],
        max: [6, 'El orden máximo es 6'],
        required: [true, 'El orden es requerido'],
    },
    active: {
        type: Boolean,
        default: true,
    },
});

topTattooSchema.pre("save", async function (next) {
    if (this.isNew || this.isModified("active")) {
        const imageActiveOrder = await mongoose.models.TopTattoo.countDocuments({ active: true });
        if (this.active && imageActiveOrder >= 6) {
            return next(new Error('Solo se pueden tener 6 imagenes activas'));
        }
    }
    next();
});

topTattooSchema.post('findOneAndDelete', async function (doc, next) {
    if (doc) {
        const image = await mongoose.models.TopTattoo.find({}).sort({ order: 1 });
        for (let i = 0; i < image.length; i++) {
            image[i].order = i + 1;
            await image[i].save();
        }
    }    
});

const TopTattoo = mongoose.model('TopTattoo', topTattooSchema);

module.exports = TopTattoo;