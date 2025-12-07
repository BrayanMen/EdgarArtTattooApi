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
            enum: ['client', 'admin', 'artist'],
            default: 'client',
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

        passwordChangedAt: Date,
        emailVerified: { type: Boolean, default: false },
        emailVerificationToken: String,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    commonSchemaOptions
);

// ✅ 1. Middleware 'save': Hash de contraseña + Actualizar timestamp
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 12);

    // Si no es un usuario nuevo, actualizamos la fecha de cambio de contraseña
    // Restamos 1 segundo para asegurar que el token creado justo después sea válido
    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000;
    }
});

// ✅ 2. Método de Instancia: Verificar Contraseña
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ 3. Método de Instancia: Verificar si la contraseña cambió después del Token (EL QUE FALTABA)
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        // Si el momento en que se cambió la contraseña es > momento en que se emitió el token
        // Significa que el token es viejo y debe ser inválido.
        return JWTTimestamp < changedTimestamp;
    }

    // False significa que NO ha cambiado
    return false;
};

// ✅ 4. Hook 'findOneAndDelete': Limpieza de Cloudinary
UserSchema.pre('findOneAndDelete', async function () {
    const doc = await this.model.findOne(this.getQuery());

    if (doc && doc.image && doc.image.public_id) {
        await deleteFromCloudinary(doc.image.public_id).catch(err => {
            console.error('Error borrando imagen de usuario:', err);
        });
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
