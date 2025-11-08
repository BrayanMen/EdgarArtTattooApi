const TopTatto = require("../Models/TopTattoo");
const {catchAsync} = require('../Utils/catchAsync');

const addImageAtPosition = catchAsync(async (req, res) => {
  try {
    const { image, order } = req.body;

    const activeImagesCount = await TopTattoo.countDocuments({ active: true });
    if (activeImagesCount >= 6) {
      return res.status(400).json({ message: 'No puedes tener más de 6 imágenes activas' });
    }

    const imagesToReorder = await TopTattoo.find({ order: { $gte: order } }).sort({ order: 1 });
    for (const imageObj of imagesToReorder) {
      if (imageObj.order < 6) {
        imageObj.order += 1;
      } else {
        imageObj.active = false;
      }
      await imageObj.save();
    }

    const newImage = await TopTattoo.create({
      image,
      order,
      active: true,
    });

    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error al agregar la imagen:', error.message);
    res.status(500).json({ message: 'No se pudo agregar la imagen. Inténtalo nuevamente.' });
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

const toggleActiveImage = catchAsync(async (req, res) => {
  const { id } = req.params;

  const tattoo = await TopTattoo.findById(id);
  if (!tattoo) return res.status(404).json({ message: "Tatuaje no encontrado" });

  const activeTatto = await TopTattoo.countDocuments({ active: true });

  if (tattoo.active && activeTatto <= 1) {
    return res.status(400).json({ message: "Debes tener al menos un tatuaje activo" });
  }

  if (!tattoo.active && activeTatto >= 6) {
    return res.status(400).json({ message: "Solo puedes tener 6 tatuajes activos" });
  }

  tattoo.active = !tattoo.active;
  await tattoo.save();

  res.json({ message: "Estado actualizado", tattoo });
});


module.exports = {
   addImageAtPosition,
   reOrder,
   toggleActiveImage
}
