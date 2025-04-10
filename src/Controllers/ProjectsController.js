const Projects = require('../Models/Projects');
const catchAsync = require('../Utils/catchAsync');
const AppError =  require('../Utils/AppError');

const getAllProjects = catchAsync(async(req, res, next)=>{
    const projects = await Projects.find();
    res.status(200).json({
        status: 'Success',
        results: projects.length,
        data: {projects}
    });
});

const getProject = catchAsync(async(req,res,next)=>{
    const project = await Projects.findById(req.params.id);
    if(!project){
        return next(new AppError("No se encontro el proyecto", 404))
    }
    res.status(200).json({
        status: 'Success',
        data: {project}
    });
});

const createProject = catchAsync(async(req, res, next)=>{
    const newProject = await Projects.create(req.body);
    if (!newProject) {
        return next(new AppError("No se pudo crear el proyecto", 400))
    }
    res.status(201).json({
        status: 'Success',
        data: {project: newProject}
    })
});

const updateProject = catchAsync(async(req, res, next)=>{
    const project = await Projects.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true
    });
    if(!project){
        return next(new AppError("No se encontro el proyecto para actualizar", 404))
    }
    res.status(200).json({
        status: 'Success',
        data: {project}
    })
})

const deleteProject = catchAsync(async (req, res, next)=>{
    const project = await Projects.findByIdAndDelete(req.params.id);
    if(!project){
        return next(new AppError("No se encontro el proyecto para eliminar", 404))
    }
    res.status(204).json({
        status: 'Success',
        data: null
    })
})

module.exports = {
    getAllProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject
}