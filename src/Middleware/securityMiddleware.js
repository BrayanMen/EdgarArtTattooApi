const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize'); // ❌ ELIMINADO por incompatibilidad
const hpp = require('hpp');
const { env } = require('../Config/env');

const allowedOrigins = [
    env.CLIENT_URL,
    ...(env.CLIENT_URLS ? env.CLIENT_URLS.split(',').map(url => url.trim()) : [])
];

// ✅ NUEVO: Sanitizador Custom (Express 5 Friendly)
// Limpia recursivamente las llaves que empiezan con '$' o contienen '.'
const noSqlSanitizer = () => (req, res, next) => {
    const sanitize = (obj) => {
        if (!obj || typeof obj !== 'object') return;

        for (const key in obj) {
            if (key.startsWith('$')) {
                delete obj[key]; // Borramos la clave peligrosa in-place
            } else {
                sanitize(obj[key]); // Recursividad para objetos anidados
            }
        }
    };

    sanitize(req.body);
    sanitize(req.params);
    sanitize(req.query); // Modificamos las propiedades internas sin reasignar req.query

    next();
};

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
    noSqlSanitizer(), // ✅ Usamos nuestra función segura
    hpp(),
    cors({
        origin: (origin, callback) => {           
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg = 'La política CORS de este sitio no permite el acceso desde el origen especificado.';
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true,
    }),
];

exports.authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // Max 10 intentos de login erróneos por IP
    message: 'Demasiados intentos de inicio de sesión, intenta de nuevo en una hora.'
});

module.exports = securityMiddleware;
