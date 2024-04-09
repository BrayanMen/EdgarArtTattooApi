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
        required: [true, 'Por favor ingresar su Contraseña'],
        minlength: [6, 'Su contraseña debe tener mas de 6 Caracteres.']
    },
    image: {
        type: String,
    },
},
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', UserSchema);

module.exports = User;