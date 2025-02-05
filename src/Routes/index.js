const { Router } = require('express')
const router = Router()
const { uploadMedia, processMedia } = require('../Middleware/uploadMiddleware');
const userRouter = require('./UserRouter');
const reviewRouter = require('./ReviewsRouter');
const { runEmailTest } = require('../Utils/testEmail');

// router.get("/prueba", (req, res)=>{
//     return res.status(200).send('Servidor funcionando...')
// });

if (process.env.NODE_ENV === 'development') {
  router.post('/test-email', async (req, res) => {
    try {
      await testEmail();
      res.status(200).json({
        status: 'success',
        message: 'Email de prueba enviado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error al enviar email de prueba',
        error: error.message
      });
    }
  });
}

runEmailTest();

router.use('/users', userRouter);
router.use('/reviews', reviewRouter);

router.post(
    '/upload',
    uploadMedia('file'), 
    processMedia('file'),
    (req, res) => {
      res.status(200).json({
        message: 'Archivo subido exitosamente',
        data: req.body.file
      });
    }
  );

module.exports = router;