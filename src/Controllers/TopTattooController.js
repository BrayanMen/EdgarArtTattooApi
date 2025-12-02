const TopTattoo = require('../Models/TopTattoo'); // Corregí el typo "TopTatto"
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/catchAsync');
const factory = require('./handlerFactory');

// 1. Agregar Imagen (Con validación de límite)
exports.addImageAtPosition = catchAsync(async (req, res, next) => {
    const { image, order } = req.body;

    // Validación extra por seguridad (aunque el modelo ya lo tiene)
    const activeCount = await TopTattoo.countDocuments({ active: true });
    if (activeCount >= 6) {
        return next(new AppError('Límite de 6 imágenes alcanzado. Desactiva una primero.', 400));
    }

    // Desplazar imágenes existentes si ocupamos su lugar
    // Ej: Si meto una en pos 2, la 2, 3, 4... se mueven a +1
    await TopTattoo.updateMany(
        { order: { $gte: order } },
        { $inc: { order: 1 } }
    );

    const newImage = await TopTattoo.create({
        image,
        order,
        active: true,
    });

    res.status(201).json({
        status: 'success',
        data: { data: newImage }
    });
});

// 2. Reordenamiento Drag & Drop (Desde el Admin Panel)
exports.reOrder = catchAsync(async (req, res, next) => {
    const tattoos = req.body; // Espera array: [{ _id: '...', order: 1 }, { _id: '...', order: 2 }]

    if (!Array.isArray(tattoos)) {
         return next(new AppError('Formato inválido. Se requiere un array.', 400));
    }

    // Operación masiva eficiente (BulkWrite)
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

// 3. Toggle Activo/Inactivo
exports.toggleActiveImage = catchAsync(async (req, res, next) => {
    const tattoo = await TopTattoo.findById(req.params.id);
    if (!tattoo) return next(new AppError('No encontrado', 404));

    // Validar reglas de negocio antes de cambiar
    const activeCount = await TopTattoo.countDocuments({ active: true });

    if (!tattoo.active && activeCount >= 6) {
        return next(new AppError('Ya hay 6 imágenes activas.', 400));
    }
    // Opcional: Impedir dejar 0 activas
    // if (tattoo.active && activeCount <= 1) return next(...)

    tattoo.active = !tattoo.active;
    await tattoo.save();

    res.status(200).json({
        status: 'success',
        data: { data: tattoo }
    });
});

// CRUD Estándar
exports.getAllTopTattoos = factory.getAll(TopTattoo);
exports.deleteTopTattoo = factory.deleteOne(TopTattoo);
exports.getTopTattoo = factory.getOne(TopTattoo);