const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('No has iniciado sesión! Inicia sesión para acceder.', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError('El usuario que pertenece a este token ya no existe.', 401));
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('El usuario ha cambiado su contraseña recientemente. Inicie sesión de nuevo.', 401));
  }

  req.user = user;
  next();
});

const restrictTo = (...roles) => catchAsync(async (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new AppError('No tienes permiso para esta acción', 403);
  }
  next();
});

module.exports = {
  protect,
  restrictTo,
};