const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler")
const Products = require("../Models/Products")

//Post de Productos
const addProducts = asyncHandler(async (req, res, next) => {
    try {
        let products = await Products.find({})
        let id;
        if (products.length > 0) {
            let last_product_array = products.slice(-1);
            let last_product = last_product_array[0];
            id = last_product.id + 1
        } else {
            id = 1;
        }

        const product = new Products({
            id: id,
            name_product: req.body.name_product,
            image: req.body.image,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            date: req.body.date,
            available: req.body.available,
        });

        console.log(product);
        await product.save();
        console.log("Guardado");

        res.status(200).json({
            success: true,
            name_product: req.body.name_product
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//Delete de Productos
const removeProducts = asyncHandler(async (req, res, next) => {
    try {
        await Products.findOneAndDelete({ id: req.body.id })
        console.log("Remove")
        res.status(200).json({
            success: true,
            name_product: req.body.name_product
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//Get de Productos
const getAllProducts = asyncHandler(async (req, res, next) => {
    try {
        let products = await Products.find({});
        console.log("Todos los productos", products);
        res.status(200).send(products)
    } catch (err) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error al obtener productos" });
    }
    
})

module.exports = {
    addProducts,
    removeProducts,
    getAllProducts
}