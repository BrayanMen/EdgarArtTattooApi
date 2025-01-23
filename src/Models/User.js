const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Por favor ingresar su Nombre Completo.'],
    },
    email: {
        type: String,
        required: [true, 'Por favor ingresar su Correo.'],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        validate: {
            validator: function (v) {
                return this.authProvider === 'local' ? v && v.length >= 6 : true;
            },
            message: 'La contraseña debe tener al menos 6 caracteres'
        }
    },
    image: {
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', 'artist', 'client'],
        default: 'client'
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        required: true
    },
    socialId: {
        type: String,
    },
    socialLinks: {
        type: [String]
    },
},
    {
        timestamps: true,
    }
);

UserSchema.pre('validate', function (next) {
    if (this.authProvider === 'local' && !['admin', 'artist'].includes(this.role)) {
        this.invalidate('role', 'Rol inválido para autenticación local');
    }
    if (this.authProvider !== 'local' && this.role !== 'client') {
        this.role = 'client';
    }
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;