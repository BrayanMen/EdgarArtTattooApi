const {
    signup,
    login,
    socialLogin,
    getProfile,
    updateProfile,
    updateProfileImage,
    updatePassword,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser } = require("../Controllers/UserController");
const { protect, restrictTo } = require("../Middleware/AuthMiddleware");
const { uploadMedia, processMedia } = require("../Middleware/uploadMiddleware");

router.post('/signup', signup);
router.post('/login', login);
router.post('/social-login', socialLogin);

router.use(protect); // Middleware de autenticación

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/profile/image', uploadMedia('image'), processMedia('image'), updateProfileImage);
router.patch('/password', updatePassword);

router.use(restrictTo('admin'));

router.route('/')
    .get(getAllUsers);

router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);
