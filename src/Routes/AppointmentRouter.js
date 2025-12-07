const express = require('express');
const router = express.Router();
const { 
    requestAppointment, 
    czMyAppointments, 
    quoteAppointment, 
    scheduleAppointment, 
    getAllAppointments, 
    getAppointment,
    deleteAppointment 
} = require('../Controllers/AppointmentController');
const { protect, restrictTo } = require('../Middleware/authMiddleware');

router.use(protect);

// Cliente: Solicitar y ver mis citas
router.post('/request', requestAppointment);
router.get('/my-appointments', czMyAppointments);

// Admin: Gestionar citas
router.use(restrictTo('admin'));

router.get('/', getAllAppointments);
router.route('/:id')
    .get(getAppointment)
    .delete(deleteAppointment);

// Acciones específicas de negocio
router.patch('/:id/quote', quoteAppointment); // Edgar pone precio
router.patch('/:id/schedule', scheduleAppointment); // Se fija fecha definitiva

module.exports = router;