const { body, param, validationResult } = require('express-validator');
const AppError = require('../Utils/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => err.msg).join(', ');
    return next(new AppError(messages, 400));
  }
  next();
};

const userValidation = {
  signup: [
    body('fullName').trim().notEmpty().withMessage('Nombre completo requerido'),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
    validate
  ],
  
  login: [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
    validate
  ],
  
  updateProfile: [
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('fullName').optional().trim().notEmpty(),
    validate
  ]
};

const reviewValidation = {
  create: [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating entre 1 y 5'),
    body('comment').trim().isLength({ max: 500 }).withMessage('Comentario máximo 500 caracteres'),
    body('target').isMongoId().withMessage('ID de target inválido'),
    body('targetModel').isIn(['Projects', 'Products', 'GalleryArt']),
    validate
  ]
};

module.exports = {
  userValidation,
  reviewValidation
};