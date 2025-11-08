const TopTatto = require('../Models/TopTattoo');
const AppError = require('../Utils/AppError');
const catchAsync  = require('../Utils/catchAsync');

const addImageAtPosition = catchAsync(async (req, res, next) => {
    const { image, order } = req.body;

    const activeImagesCount = await TopTattoo.countDocuments({ active: true });

    if (activeImagesCount >= 6) {
        return next(new AppError('No puedes tener más de 6 imágenes activas', 400));
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

    res.status(201).json({
        status: 'success',
        data: newImage
    });
});

const reOrder = catchAsync(async (req, res, next) => {
    const tattoos = req.body; // Espera: [{ _id, order }]

    if (!Array.isArray(tattoos) || tattoos.length > 6) {
         return next(new AppError('Datos de reordenamiento inválidos', 400));
    }

    const bulkOps = tattoos.map(t => ({
        updateOne: {
            filter: { _id: t._id },
            update: { order: t.order }
        }
    }));

    await TopTattoo.bulkWrite(bulkOps);

    res.status(200).json({
        status: 'success',
        message: 'Orden actualizado exitosamente.'
    });
});

const toggleActiveImage = catchAsync(async (req, res) => {
    const { id } = req.params;

    const tattoo = await TopTattoo.findById(id);
    if (!tattoo) {
        return next(new AppError('Tatuaje no encontrado', 404));
    }

    const activeTattooCount = await TopTattoo.countDocuments({ active: true });

    if (tattoo.active && activeTattooCount <= 1) {
        return next(new AppError('Debes tener al menos un tatuaje activo', 400));
    }

    if (!tattoo.active && activeTattooCount >= 6) {
        return next(new AppError('Solo puedes tener 6 tatuajes activos', 400));
    }

    tattoo.active = !tattoo.active;
    await tattoo.save();

    res.status(200).json({
        status: 'success',
        message: 'Estado actualizado',
        data: { tattoo },
    });
});

module.exports = {
    addImageAtPosition,
    reOrder,
    toggleActiveImage,
};
