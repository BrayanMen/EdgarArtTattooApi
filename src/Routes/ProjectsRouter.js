const express = require('express');
const router = express.Router();
const { 
    getAllProjects, 
    createProject, 
    getProject, 
    updateProject, 
    deleteProject, 
    getProjectBySlug, 
    viewProject 
} = require('../Controllers/ProjectsController');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

// Públicas
router.get('/', getAllProjects);
router.get('/slug/:slug', getProjectBySlug); // SEO URL: /api/projects/slug/tatuaje-dragon
router.patch('/slug/:slug/view', viewProject); // Incrementar contador de visitas

// Admin
router.use(protect, restrictTo('admin'));

router.post('/', createProject);
router.route('/:id')
    .get(getProject) // Por si el admin panel necesita buscar por ID
    .patch(updateProject)
    .delete(deleteProject);

module.exports = router;