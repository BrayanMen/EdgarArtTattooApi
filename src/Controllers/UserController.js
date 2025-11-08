const catchAsync = require('../Utils/catchAsync');
const User = require('../Models/User');
const AppError = require('../Utils/AppError');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {
    uploadMedia,
    processMedia,
    deleteFromCloudinary,
} = require('../Middleware/uploadMiddleware');
const { sendVerifyEmail, sendPasswordReset } = require('../Config/nodemailer');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user },
    });
};

const signup = catchAsync(async (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new AppError('El cuerpo de la solicitud está vacío', 400));
    }

    const { email, fullName, password, role } = req.body;

    if (!email || !fullName || !password) {
        return next(new AppError('Email, nombre completo y contraseña son requeridos', 400));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new AppError('El email ya está registrado', 400));
    }

    const newUser = await User.create({
        fullName,
        email,
        password,
        role: role || 'client',
        authProvider: 'local',
    });

    const token = crypto.randomBytes(32).toString('hex');
    newUser.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    await newUser.save({ validateBeforeSave: false });

    // await sendVerifyEmail(newUser.email, token);

    createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Por favor proporcione email y contraseña', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('Email o contraseña incorrectos', 401));
    }

    createSendToken(user, 200, res);
});

const socialLogin = catchAsync(async (req, res, next) => {
    const { email, fullName, image, socialId, authProvider } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            email,
            fullName,
            image,
            socialId,
            authProvider,
            emailVerified: true,
        });
    } else if (user.authProvider !== authProvider) {
        return next(new AppError(`Esta cuenta está registrada con ${user.authProvider}`, 400));
    }

    createSendToken(user, 200, res);
});

const verificationMail = catchAsync(async (req, res, next) => {
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

const updateProfile = catchAsync(async (req, res, next) => {
    const allowedUpdates = ['fullName', 'email', 'socialLinks'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return next(new AppError('Actualizaciones no válidas', 400));
    }

    const user = await User.findById(req.user.id);

    updates.forEach(update => (user[update] = req.body[update]));
    await user.save();

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

const updateProfileImage = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (user.image?.public_id) {
        await deleteFromCloudinary(user.image.public_id);
    }

    user.image = req.body.image;

    await user.save();

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

const forgotPassword = catchAsync(async (req, res, next) => {
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

const resetPassword = catchAsync(async (req, res, next) => {
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

const updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(req.body.currentPassword))) {
        return next(new AppError('Contraseña actual incorrecta', 401));
    }

    user.password = newPassword;
    await user.save();

    createSendToken(user, 200, res);
});

const getProfile = catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

const getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users },
    });
});

const getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('No se encontró el usuario', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

const updateUser = catchAsync(async (req, res, next) => {
    const allowedUpdates = ['fullName', 'email', 'role', 'active'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return next(new AppError('Actualizaciones no válidas', 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('No se encontró el usuario', 404));
    }

    updates.forEach(update => (user[update] = req.body[update]));
    await user.save();

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

const deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('No se encontró el usuario', 404));
    }

    if (user.image?.public_id) {
        await deleteFromCloudinary(user.image.public_id);
    }

    await user.remove();

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

module.exports = {
    signup,
    login,
    socialLogin,
    verificationMail,
    updateProfile,
    updateProfileImage,
    forgotPassword,
    resetPassword,
    updatePassword,
    getProfile,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
};
