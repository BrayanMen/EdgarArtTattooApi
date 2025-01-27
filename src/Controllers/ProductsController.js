import axios from 'axios';
import Product from '../models/Product';

const syncWithMercadoLibre = catchAsync(async (productId) => {
  const product = await Product.findById(productId);
  
  const mlProduct = await axios.post('https://api.mercadolibre.com/items', {
    title: product.name,
    description: product.description.full,
    price: product.pricing.basePrice,
    stock: product.inventory.stock
  }, {
    headers: {
      Authorization: `Bearer ${process.env.MERCADOLIBRE_API_KEY}`
    }
  });

  product.pricing.mercadoLibreId = mlProduct.data.id;
  await product.save();
  
  return product;
});

module.exports = {
    syncWithMercadoLibre
}