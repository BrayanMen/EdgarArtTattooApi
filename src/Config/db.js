const mongoose = require('mongoose');
const { logger } = require('../Utils/logger');
const MONGO_URI  = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        // Mongoose 9+ ya tiene estos defaults, no hay que pasarlos
        await mongoose.connect(MONGO_URI, {
            autoIndex: true, // Útil para crear índices en dev
        });
        logger.info('MongoDB Conectado');
    } catch (error) {
        logger.error(`Error de conexión DB: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;