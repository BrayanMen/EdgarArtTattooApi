const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
            validator: function (password) {
                return this.authProvider === 'local' ? 
                password && password.length >= 6 : true;
            },
            message: 'La contraseña debe tener al menos 6 caracteres'
        }
    },
    image: {
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', 'client'],
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
    if (this.authProvider === 'local' && !['admin'].includes(this.role)) {
        this.invalidate('role', 'Rol inválido para autenticación local');
    }
    if (this.authProvider !== 'local' && this.role !== 'client') {
        this.role = 'client';
    }
    next();
});

UserSchema.pre('save', async function(next) {
    if (this.isModified('password') && this.authProvider === 'local') {
      this.password = await bcrypt.hash(this.password, 12);
    }
    next();
  });
  
  UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };
  
  UserSchema.methods.generateAuthToken = function() {
    return jwt.sign(
      { id: this._id, role: this.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );
  };

const User = mongoose.model('User', UserSchema);

module.exports = User;