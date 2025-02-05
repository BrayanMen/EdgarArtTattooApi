const { Router } = require('express');
const { syncWithMercadoLibre } = require('../Controllers/ProductsController');
const router = Router();

router.post('/sync-ml/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await syncWithMercadoLibre(productId);
    res.status(200).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;