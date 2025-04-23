const TopTatto = require("../Models/TopTattoo");
const {catchAsync} = require('../Utils/catchAsync');

const addImageAtPosition = catchAsync(async (imageUrl, order) => {
    try {      
      const activeImagesCount = await TopTatto.countDocuments({ active: true });
      if (activeImagesCount >= 6) {
        throw new Error('No puedes tener más de 6 imágenes activas');
      }  
      const imagesToReorder = await TopTatto.find({ order: { $gte: order } }).sort({ order: 1 });
      for (const image of imagesToReorder) {
        if (image.order < 6) {
          image.order += 1; 
          await image.save();
        } else {        
          image.active = false;
          await image.save();
        }
      }
  
      const newImage = new TopTattoo({
        image: imageUrl,
        order: order,
        active: true,
      });

      await newImage.save();
  
      console.log('Imagen agregada exitosamente en la posición:', order);
    } catch (error) {
      console.error('Error al agregar la imagen:', error.message);
      throw new Error('No se pudo agregar la imagen. Inténtalo nuevamente.');
    }
  });

const reOrder = catchAsync(async (req, res, next) => {
  const tattoos = req.body; // [{ _id, order }]

  if (tattoos.length > 6) {
    return res.status(400).json({ message: 'Solo se permiten 6 imágenes activas.' });
  }

  try {
    const bulkOps = tattoos.map(t => ({
      updateOne: {
        filter: { _id: t._id },
        update: { order: t.order }
      }
    }));

    await TopTatto.bulkWrite(bulkOps);

    res.status(200).json({ message: 'Orden actualizado exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar el orden:', error);
    res.status(500).json({ message: 'Error al actualizar el orden.' });
  }
});


module.exports = {
   addImageAtPosition,
   reOrder
}
