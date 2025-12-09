const mongoose = require('mongoose');
const { commonSchemaOptions } = require('../Utils/mongooseUtils');

const topTattooSchema = new mongoose.Schema(
    {
        // Objeto de imagen estandarizado para Cloudinary
        image: {
            url: { type: String, required: [true, 'La imagen es requerida'] },
            public_id: { type: String, required: true },
            format: String,
        },

        order: {
            type: Number,
            unique: true,
            min: [1, 'El orden mínimo es 1'],
            max: [6, 'El orden máximo es 6'],
            required: [true, 'El orden es requerido'],
        },

        active: { type: Boolean, default: true },
    },
    commonSchemaOptions
);

// Middleware: Validación estricta de límite (Regla de Negocio)
topTattooSchema.pre('save', async function () {
    if (this.isNew || this.isModified('active')) {
        const activeCount = await mongoose.models.TopTattoo.countDocuments({
            active: true,
            _id: { $ne: this._id },
        });
        // Si ya hay 6 y estamos intentando activar uno nuevo...
        if (this.active && activeCount >= 6) {
            return next(new Error('Límite alcanzado: Solo se permiten 6 tatuajes en el Top.'));
        }
    }
    
});

// Middleware Post-Delete: Reordenamiento automático
// Si borro el #3, el #4 pasa a ser #3, el #5 a #4, etc.
topTattooSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        const remaining = await mongoose.models.TopTattoo.find({ active: true }).sort({ order: 1 });
        for (let i = 0; i < remaining.length; i++) {
            remaining[i].order = i + 1;
            await remaining[i].save();
        }
    }
});

const TopTattoo = mongoose.model('TopTattoo', topTattooSchema);
module.exports = TopTattoo;
