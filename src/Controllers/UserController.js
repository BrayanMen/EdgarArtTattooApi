const User = require('../Models/User');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');
const factory = require('./handlerFactory'); // ¡Usamos el Factory!
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { deleteFromCloudinary } = require('../Middleware/uploadMiddleware');
const { sendVerifyEmail, sendPasswordReset } = require('../Config/nodemailer');
const { env } = require('../Config/env');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = id => {
    return jwt.sign({ id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);
    user.password = undefined; // Ocultamos password en la respuesta

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user },
    });
};

// --- AUTH PÚBLICA ---

exports.signup = catchAsync(async (req, res, next) => {
    // 1. Seguridad: Filtramos solo los campos permitidos
    const newUser = await User.create({
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        role: 'client', // FORZADO: Nadie puede registrarse como admin por aquí
        authProvider: 'local'
    });

    const token = crypto.randomBytes(32).toString('hex');
    newUser.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    await newUser.save({ validateBeforeSave: false });

    // Descomentar cuando configures el SMTP real
    // await sendVerifyEmail(newUser.email, token);

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(new AppError('Email y contraseña requeridos', 400));

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('Credenciales incorrectas', 401));
    }

    createSendToken(user, 200, res);
});

exports.socialLogin = catchAsync(async (req, res, next) => {
    const { token, authProvider } = req.body;
    let userData = {};

    if (authProvider === 'google') {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        userData = {
            email: payload.email,
            fullName: payload.name,
            image: { url: payload.picture, public_id: null },
            socialId: payload.sub,
            emailVerified: payload.email_verified,
        };
    } else {
        return next(new AppError('Proveedor no soportado', 400));
    }

    let user = await User.findOne({ email: userData.email });

    if (!user) {
        user = await User.create({
            ...userData,
            password: crypto.randomBytes(16).toString('hex'),
            authProvider,
            role: 'client', // Forzamos rol
        });
    }

    createSendToken(user, 200, res);
});

exports.verificationMail = catchAsync(async (req, res, next) => {
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        emailVerificationToken: token,
    });

    if (!user) {
        return next(new AppError('Token Invalido o Vencido', 400));
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: 'Email verificado correctamente',
    });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('No se encuentra el Usuario', 404));
    }

    const token = crypto.randomBytes(32).toString('hex');
    const passwordReset = crypto.createHash('sha256').update(token).digest('hex');

    const expireDate = Date.now() + 900000; // 15 minutos

    user.passwordResetToken = passwordReset;
    user.passwordResetExpires = expireDate;
    try {
        await sendPasswordReset(user.email, token);

        res.status(200).json({
            status: 'success',
            message: 'Token enviado al correo',
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new AppError('Error al enviar el correo, prueba de nuevo', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError('Token Invalido o Expirado', 400));
    }

    user.password = req.body.newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    createSendToken(user, 200, res);
});

// --- GESTIÓN DE CUENTA (Usuario Logueado) ---

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(req.body.currentPassword))) {
        return next(new AppError('Contraseña actual incorrecta', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    createSendToken(user, 200, res);
});

exports.getProfile = catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

// Helper para filtrar objetos
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.updateProfile = catchAsync(async (req, res, next) => {
    // 1. Prevenir que intenten cambiar password o rol aquí
    if (req.body.password || req.body.role) {
        return next(
            new AppError('Esta ruta no es para contraseñas o roles. Usa /update-password', 400)
        );
    }

    // 2. Filtrar campos permitidos (SOLO lo que el usuario puede editar de sí mismo)
    const filteredBody = filterObj(req.body, 'fullName', 'email', 'socialLinks');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: { user: updatedUser },
    });
});

exports.updateProfileImage = catchAsync(async (req, res, next) => {
    // Cloudinary processing ya ocurrió en el middleware 'processMedia'
    // La imagen procesada viene en req.body.image
    if (!req.body.image) return next(new AppError('No se proporcionó imagen', 400));

    const user = await User.findById(req.user.id);

    // Si ya tenía imagen, la borramos de Cloudinary
    if (user.image && user.image.public_id) {
        await deleteFromCloudinary(user.image.public_id);
    }

    user.image = req.body.image;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

// --- ADMIN ROUTES (Usando Factory) ---
// Estas rutas DEBEN estar protegidas con restrictTo('admin') en el Router

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); 
exports.deleteUser = factory.deleteOne(User);