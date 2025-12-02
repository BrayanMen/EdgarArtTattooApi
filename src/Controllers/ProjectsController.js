const Projects = require('../Models/Projects');
const factory = require('./handlerFactory'); // ¡Nuestro Factory mágico!
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');

// --- LÓGICA DE NEGOCIO ---

// 1. Obtener Proyecto por Slug (SEO Friendly)
// GET /projects/tatuaje-samurai-color
exports.getProjectBySlug = catchAsync(async (req, res, next) => {
    const project = await Projects.findOne({ slug: req.params.slug });
    
    if (!project) {
        return next(new AppError('No se encontró el proyecto', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { project }
    });
});

// 2. Contador de Visitas (Analytics simple)
// POST /projects/tatuaje-samurai-color/view
exports.viewProject = catchAsync(async (req, res, next) => {
    // Incrementa el contador 'stats.views' en 1 de forma atómica (segura para concurrencia)
    const project = await Projects.findOneAndUpdate(
        { slug: req.params.slug },
        { $inc: { 'stats.views': 1 } },
        { new: true }
    ).select('stats.views'); // Solo devolvemos el dato necesario

    if (!project) return next(new AppError('Proyecto no encontrado', 404));
    
    res.status(200).json({
        status: 'success',
        views: project.stats.views
    });
});

// --- CRUD ESTÁNDAR (Usando Factory) ---

exports.getAllProjects = factory.getAll(Projects);
exports.createProject = factory.createOne(Projects);
exports.updateProject = factory.updateOne(Projects);
exports.deleteProject = factory.deleteOne(Projects);
// Mantenemos getProject por ID para el Panel de Admin
exports.getProject = factory.getOne(Projects);