const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { stringRequired, commonSchemaOptions } = require('../Utils/mongooseUtils');
const { deleteFromCloudinary } = require('../Middleware/uploadMiddleware');

const UserSchema = new mongoose.Schema(
    {
        fullName: stringRequired('Nombre completo', 80),
        email: {
            type: String,
            required: [true, 'El email es requerido'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Email inválido'], // Regex simple de email
        },
        password: {
            type: String,
            select: false, // Por seguridad, nunca devolver password en queries normales
            minlength: 8,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'artist'],
            default: 'user',
        },

        // Autenticación Social
        authProvider: {
            type: String,
            enum: ['local', 'google', 'facebook', 'instagram'],
            default: 'local',
        },
        socialId: { type: String, select: false },

        image: {
            url: String,
            public_id: String,
        },

        emailVerified: { type: Boolean, default: false },
        emailVerificationToken: String,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    commonSchemaOptions
);

// Middleware para hashear password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Hook: Se ejecuta antes de que un documento sea borrado de la DB
UserSchema.pre('findOneAndDelete', async function (next) {
    // Obtenemos el documento que se va a borrar
    const doc = await this.model.findOne(this.getQuery());

    // Si tiene imagen y public_id, la borramos de Cloudinary
    if (doc && doc.image && doc.image.public_id) {
        await deleteFromCloudinary(doc.image.public_id).catch(err => {
            console.error('Error borrando imagen de usuario:', err);
            // No detenemos el proceso, solo logueamos el error
        });
    }
    next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
