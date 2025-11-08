const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { env } = require('../Config/env');

const securityMiddleware = [
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", 'trusted-cdn.com'],
                styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
                imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
                connectSrc: ["'self'", 'https://api.mercadolibre.com'],
                fontSrc: ["'self'", 'fonts.gstatic.com'],
            },
        },
        crossOriginEmbedderPolicy: true,
    }),
    helmet.referrerPolicy({ policy: 'no-referrer' }),
    helmet.hsts({ maxAge: 63072000, includeSubDomains: true, preload: true }),
    helmet.xssFilter(),
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 500,
        message: 'Demasiadas solicitudes desde esta IP',
    }),
    mongoSanitize(),
    hpp(),
    cors({
        origin: env.CLIENT_URLS ? env.CLIENT_URLS.split(',') : env.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }),
];

module.exports = securityMiddleware;
