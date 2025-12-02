const { Router } = require('express');
const router = Router();
const { uploadMedia, processMedia } = require('../Middleware/uploadMiddleware');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

// Importar Routers
const userRouter = require('./UserRouter');
const reviewRouter = require('./ReviewsRouter');
const topTattooRouter = require('./topTattooRoutes');
const productsRouter = require('./ProductsRouter');
const projectsRouter = require('./ProjectsRouter'); // Necesitas crear este archivo
// const seminarsRouter = require('./SeminarsRouter'); // Futura implementación

// Health Check
router.get('/health', (req, res) => res.status(200).send('API OK'));

// Rutas de Negocio
router.use('/users', userRouter);
router.use('/reviews', reviewRouter);
router.use('/top-tattoos', topTattooRouter);
router.use('/products', productsRouter);
router.use('/projects', projectsRouter); // Ahora el front puede llamar a /api/projects

// Ruta Universal de Carga (Para uso administrativo rápido o wysiwyg editors)
router.post(
    '/upload-global',
    protect,
    restrictTo('admin'),
    uploadMedia('file'), // 'file' es el nombre del campo en el FormData
    processMedia('file'),
    (req, res) => {
        res.status(200).json({
            status: 'success',
            data: req.body.file, // Retorna la URL y public_id
        });
    }
);

module.exports = router;
