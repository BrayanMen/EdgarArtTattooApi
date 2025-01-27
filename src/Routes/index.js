const { Router } = require('express')
const router = Router()
const productsRouter = require("./ProductsRouter");
const { uploadMedia, processMedia } = require('../Middleware/uploadMiddleware');

// router.get("/prueba", (req, res)=>{
//     return res.status(200).send('Servidor funcionando...')
// });

router.use("/dashboard", productsRouter)

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