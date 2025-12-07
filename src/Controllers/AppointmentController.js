const Appointment = require('../Models/Appointment');
const User = require('../Models/User');
const factory = require('./handlerFactory');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');
const { sendEmail } = require('../Utils/emailTemplate'); // Asumo un util de email genérico

// 1. Cliente solicita cita
exports.requestAppointment = catchAsync(async (req, res, next) => {
    // Forzamos que el cliente sea el usuario logueado
    req.body.client = req.user.id;
    req.body.status = 'requested'; // Siempre inicia así

    const appointment = await Appointment.create(req.body);

    // TODO: Enviar email a Edgar avisando nueva solicitud
    
    res.status(201).json({
        status: 'success',
        data: { appointment }
    });
});

// 2. Edgar responde con cotización
exports.quoteAppointment = catchAsync(async (req, res, next) => {
    const { price, estimatedSessions, depositAmount, adminNotes } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, {
        status: 'quoted',
        quote: { price, estimatedSessions, depositAmount },
        adminNotes // Notas privadas
    }, { new: true });

    if (!appointment) return next(new AppError('Cita no encontrada', 404));

    // TODO: Enviar email al cliente con el precio y link de pago de seña

    res.status(200).json({
        status: 'success',
        data: { appointment }
    });
});

// 3. Cliente acepta/paga seña -> Agendado
exports.scheduleAppointment = catchAsync(async (req, res, next) => {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, {
        status: 'scheduled',
        scheduledDate: req.body.date
    }, { new: true });

    res.status(200).json({
        status: 'success',
        message: 'Cita agendada exitosamente',
        data: { appointment }
    });
});

// 4. Mis Citas (Para el perfil del cliente)
exports.czMyAppointments = catchAsync(async (req, res, next) => {
    const appointments = await Appointment.find({ client: req.user.id });

    res.status(200).json({
        status: 'success',
        results: appointments.length,
        data: { appointments }
    });
});

// Admin CRUD
exports.getAllAppointments = factory.getAll(Appointment);
exports.getAppointment = factory.getOne(Appointment, { path: 'client' });
exports.deleteAppointment = factory.deleteOne(Appointment);