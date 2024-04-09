const { Router } = require('express');
const { addProducts, removeProducts, getAllProducts } = require('../Controllers/ProductsController');
const router = Router();

//POST
router.post("/addproducts", addProducts);
router.post("/removeproducts", removeProducts);
//GET
router.get("/allproducts", getAllProducts)

module.exports = router;