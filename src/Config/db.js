const mongoose = require('mongoose');
const { logger } = require('../Utils/logger');
const MONGO_URI  = process.env.MONGO_URI

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,            
            autoIndex: true,
        });
        logger.info('MongoDB Conectado');
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1)
    }
}

module.exports = connectDB;