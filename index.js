const server = require('./src/server');
require('dotenv').config();
const { env } = require('./src/Config/env');
const { logger } = require('./src/Utils/logger');
const connectDB = require('./src/Config/db');

connectDB();

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    logger.info(`Servidor corriendo en http://localhost:${PORT}`);
    logger.info(`Modo: ${process.env.NODE_ENV}`);
});

process.on('unhandledRejection', err => {
    logger.error('UNHANDLED REJECTION!');
    logger.error(err);
    process.exit(1);
});
