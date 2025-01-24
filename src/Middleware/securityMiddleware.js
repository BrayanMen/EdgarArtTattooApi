import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'trusted-cdn.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'", 'https://api.mercadolibre.com']
      }
    }
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: 'Demasiadas solicitudes desde esta IP'
  }),
  mongoSanitize(),
  hpp(),
  cors({
    origin: process.env.CLIENT_URLS.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
];