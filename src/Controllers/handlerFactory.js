const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');

// Eliminar genérico
exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No se encontró documento con ese ID', 404));
    
    // Si tiene imagen/es pública, aquí se podría inyectar lógica de borrado de Cloudinary
    // pero idealmente eso se maneja en un middleware 'pre-remove' en el Modelo.

    res.status(204).json({ status: 'success', data: null });
});

// Actualizar genérico
exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!doc) return next(new AppError('No se encontró documento con ese ID', 404));

    res.status(200).json({ status: 'success', data: { data: doc } });
});

// Crear genérico
exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: 'success', data: { data: doc } });
});

// Leer uno (con populate opcional)
exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    // Si buscamos por SLUG también:
    if (req.params.id.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) && !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        query = Model.findOne({ slug: req.params.id });
    }
    
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) return next(new AppError('No se encontró documento', 404));

    res.status(200).json({ status: 'success', data: { data: doc } });
});

// Leer todos (con filtros básicos)
exports.getAll = Model => catchAsync(async (req, res, next) => {
    // Permitir filtros anidados para reviews (hack para rutas anidadas)
    let filter = {};
    if (req.params.projectId) filter = { project: req.params.projectId };

    // Ejecutar query
    const features = Model.find(filter); // Aquí podrías agregar una clase APIFeatures para paginación/sort
    const doc = await features;

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: { data: doc }
    });
});