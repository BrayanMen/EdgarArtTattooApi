import express from 'express';
import  {securityMiddleware}  from './Middleware/securityMiddleware';
import { logger } from './Utils/logger';
import {  validateEnv } from './Config/env';
import router from './Routes/index';
import {errorHandler} from './Middleware/errorMiddlewarw';

validateEnv();

const server = express();

// Middlewares
server.use(express.json({ limit: '10kb' }));
server.use(express.urlencoded({ extended: true, limit: '10kb' }));
server.use(securityMiddleware);
server.use(logger);
server.disable('x-powered-by');
server.use((req, res, next) => {
  res.cookie('token', 'value', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
  });
  next();
});

// Rutas
server.use('/', router);


// Manejador de Errores 
server.use((req, res, next) => {
  next(new AppError(`No se pudo encontrar ${req.originalUrl} en este servidor.`, 404));
});
server.use(errorHandler);

module.exports = server;