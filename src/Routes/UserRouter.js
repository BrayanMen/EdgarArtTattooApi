const express = require('express');
const router = express.Router();
const { 
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
    deleteUser 
} = require('../Controllers/UserController');
const { protect, restrictTo } = require('../Middleware/AuthMiddleware');
const { uploadMedia, processMedia } = require('../Middleware/uploadMiddleware');

// Rutas públicas
router.post('/signup', signup);
router.post('/login', login);
router.post('/social-login', socialLogin);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.get('/verify/:token', verificationMail);

// Rutas protegidas
router.use(protect);

router.route('/profile')
    .get(getProfile)
    .patch(updateProfile);

router.patch('/profile/image', 
    uploadMedia('image'),
    processMedia('image'),
    updateProfileImage
);

router.patch('/update-password', updatePassword);

router.use(restrictTo('admin'));

router.route('/')
    .get(getAllUsers);

router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;