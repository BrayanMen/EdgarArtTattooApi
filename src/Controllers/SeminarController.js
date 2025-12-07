const Seminar = require('../Models/Seminar');
const factory = require('./handlerFactory');
const catchAsync = require('../Utils/catchAsync');

// Obtener seminarios activos (Público)
exports.getActiveSeminars = catchAsync(async (req, res, next) => {
    const seminars = await Seminar.find({ active: true, 'dates.start': { $gte: new Date() } })
        .sort('dates.start');

    res.status(200).json({
        status: 'success',
        results: seminars.length,
        data: { seminars }
    });
});

// Admin: CRUD Completo
exports.createSeminar = factory.createOne(Seminar);
exports.getAllSeminars = factory.getAll(Seminar);
exports.getSeminar = factory.getOne(Seminar); // Funciona con ID o Slug gracias al Factory
exports.updateSeminar = factory.updateOne(Seminar);
exports.deleteSeminar = factory.deleteOne(Seminar);