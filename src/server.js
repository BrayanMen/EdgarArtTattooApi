const express = require('express');
const securityMiddleware = require('./Middleware/securityMiddleware');
const { validateEnv } = require('./Config/env');
const router = require('./Routes/index');
const errorHandler = require('./Middleware/errorMiddleware');
const morgan = require('morgan');
const AppError = require('./Utils/AppError');
const cookieParser = require('cookie-parser');
const { logger } = require('./Utils/logger');

validateEnv();

const server = express();

// Middlewares
server.use(express.json({ limit: '50kb' }));
server.use(express.urlencoded({ extended: true, limit: '50kb' }));
server.use(cookieParser());
server.use(securityMiddleware);
server.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
server.disable('x-powered-by');

server.use('/', router);

// Manejador de Errores
server.use((req, res, next) => {
    next(new AppError(`No se pudo encontrar ${req.originalUrl} en este servidor.`, 404));
});
server.use(errorHandler);

module.exports = server;
