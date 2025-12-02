const Projects = require('../Models/Projects');
const catchAsync = require('../Utils/catchAsync');
const factory = require('./handlerFactory');

// Middleware para buscar por Slug en lugar de ID (SEO Friendly)
exports.getProjectBySlug = catchAsync(async (req, res, next) => {
    const project = await Projects.findOne({ slug: req.params.slug });

    if (!project) {
        return next(new AppError('No se encontró proyecto con ese nombre', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { project },
    });
});

// Lógica para añadir "Views" (contador de visitas)
exports.viewProject = catchAsync(async (req, res, next) => {
    const project = await Projects.findOneAndUpdate(
        { slug: req.params.slug },
        { $inc: { 'stats.views': 1 } }, // Incrementa 1 atomicamente
        { new: true }
    );

    res.status(200).json({ status: 'success', views: project.stats.views });
});

// CRUD Estándar
exports.createProject = factory.createOne(Projects);
exports.getAllProjects = factory.getAll(Projects);
exports.updateProject = factory.updateOne(Projects);
exports.deleteProject = factory.deleteOne(Projects);
exports.getProject = factory.getOne(Projects);
