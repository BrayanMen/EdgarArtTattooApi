const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UserController');
const { protect, restrictTo } = require('../Middleware/authMiddleware');
const { uploadMedia, processMedia } = require('../Middleware/uploadMiddleware');

// --- 1. Autenticación Pública ---
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/social-login', userController.socialLogin);

router.post('/forgot-password', userController.forgotPassword);
router.patch('/reset-password/:token', userController.resetPassword);
router.get('/verify/:token', userController.verificationMail);

// --- 2. Rutas Protegidas (Requieren Login) ---
router.use(protect); // Aplica a todo lo de abajo

router.patch('/update-password', userController.updatePassword);

router.route('/profile').get(userController.getProfile).patch(userController.updateProfile);

router.patch(
    '/profile/image',
    uploadMedia('image'), // Middleware de Multer
    processMedia('image'), // Middleware de Cloudinary/Sharp
    userController.updateProfileImage
);

// --- 3. Rutas de Administrador ---
router.use(restrictTo('admin')); // Aplica a todo lo de abajo

router.route('/').get(userController.getAllUsers);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
