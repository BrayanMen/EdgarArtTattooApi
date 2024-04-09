const { Router } = require('express')
const router = Router()
const productsRouter = require("./ProductsRouter")

// router.get("/prueba", (req, res)=>{
//     return res.status(200).send('Servidor funcionando...')
// });

router.use("/dashboard", productsRouter)

module.exports = router;