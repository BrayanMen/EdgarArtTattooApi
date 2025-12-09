const { Router } = require('express');
const router = Router();
const { uploadMedia, processMedia } = require('../Middleware/uploadMiddleware');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

// Importar Routers
const userRouter = require('./UserRouter');
const reviewRouter = require('./ReviewsRouter');
const topTattooRouter = require('./TopTattooRoutes');
const productsRouter = require('./ProductsRouter');
const projectsRouter = require('./ProjectsRouter');
const galleryRouter = require('./GalleryRouter');
const orderRouter = require('./OrderRouter');
const appointmentRouter = require('./AppointmentRouter');
const seminarRouter = require('./SeminarRouter');

// Health Check
router.get('/health', (req, res) => res.status(200).send('API v2 OK 🚀'));

// Rutas de Negocio
router.use('/users', userRouter);
router.use('/reviews', reviewRouter);
router.use('/top-tattoos', topTattooRouter);
router.use('/products', productsRouter);
router.use('/projects', projectsRouter);
router.use('/gallery', galleryRouter);
router.use('/orders', orderRouter);
router.use('/appointments', appointmentRouter);
router.use('/seminars', seminarRouter);

// Ruta Universal de Carga (Para uso administrativo rápido o wysiwyg editors)
// Retorna la URL para que el front la pegue donde quiera
router.post(
    '/upload-global',
    protect,
    restrictTo('admin'),
    uploadMedia('file'),
    processMedia('file'),
    (req, res) => {
        res.status(200).json({
            status: 'success',
            message: 'Archivo subido exitosamente',
            data: req.body.file, // { url: '...', public_id: '...' }
        });
    }
);

module.exports = router;