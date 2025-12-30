const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Tipos permitidos
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const VIDEO_TYPES = ['video/mp4', 'video/mkv', 'video/avi', 'video/webm'];
const THREED_TYPES = ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'];
const TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES, ...THREED_TYPES];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: (req, file, cb) => {
        if (TYPES.includes(file.mimetype) || file.originalname.match(/\.(glb|gltf|obj)$/)) {
            cb(null, true);
        } else {
            cb(new AppError(`Tipo de archivo no permitido.`, 400), false);
        }
    },
});

// Helper: Detectar tipo de recurso para Cloudinary
const getResourceType = (mimetype, originalname) => {
    if (IMAGE_TYPES.includes(mimetype)) return 'image';
    if (VIDEO_TYPES.includes(mimetype)) return 'video';
    // GLB/GLTF suelen ir mejor como 'raw' o 'image' dependiendo del caso, 'raw' es más seguro para archivos binarios
    if (THREED_TYPES.includes(mimetype) || originalname.match(/\.(glb|gltf|obj)$/)) return 'raw';
    return 'auto';
};

const processImage = async buffer => {
    try {
        return await sharp(buffer)
            .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
    } catch (error) {
        throw new AppError('Error al procesar la imagen', 500);
    }
};

const uploadToCloudinary = (buffer, resourceType) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            resource_type: resourceType,
            folder: process.env.CLOUDINARY_FOLDER || 'uploads',
            // Solo analizamos calidad si es imagen/video
            quality_analysis: resourceType !== 'raw',
        };

        cloudinary.uploader
            .upload_stream(uploadOptions, (error, result) => {
                if (error) reject(new AppError('Error al subir archivo a Cloudinary', 500));
                else resolve(result);
            })
            .end(buffer);
    });
};

// --- Middleware para campos individuales (Avatar, etc) ---
const processMedia = fieldName =>
    catchAsync(async (req, res, next) => {
        if (!req.file) return next();

        const resourceType = getResourceType(req.file.mimetype, req.file.originalname);
        let finalBuffer = req.file.buffer;

        // Solo procesamos con Sharp si es IMAGEN
        if (resourceType === 'image') {
            finalBuffer = await processImage(req.file.buffer);
        }

        const uploaded = await uploadToCloudinary(finalBuffer, resourceType);

        req.body[fieldName] = {
            public_id: uploaded.public_id,
            url: uploaded.secure_url,
            resource_type: uploaded.resource_type,
            format: uploaded.format,
        };
        next();
    });

// --- Middleware para Galería (Múltiples campos) ---
const uploadGalleryFields = upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'secondaryImage', maxCount: 1 },
    { name: 'backgroundImage', maxCount: 1 },
]);

const processGalleryMedia = catchAsync(async (req, res, next) => {
    if (!req.files) return next();

    // Helper inteligente que decide si usar Sharp o no
    const smartUpload = async fileObj => {
        const type = getResourceType(fileObj.mimetype, fileObj.originalname);
        let buffer = fileObj.buffer;

        // CORRECCIÓN: No pasar archivos 3D/Video por sharp
        if (type === 'image') {
            buffer = await processImage(buffer);
        }

        return await uploadToCloudinary(buffer, type);
    };

    // Procesamos cada campo
    if (req.files.mainImage) {
        const upload = await smartUpload(req.files.mainImage[0]);
        req.body.images = req.body.images || {};
        req.body.images.main = { url: upload.secure_url, public_id: upload.public_id };
    }

    if (req.files.secondaryImage) {
        const upload = await smartUpload(req.files.secondaryImage[0]);
        req.body.images = req.body.images || {};
        req.body.images.secondary = { url: upload.secure_url, public_id: upload.public_id };
    }

    if (req.files.backgroundImage) {
        const upload = await smartUpload(req.files.backgroundImage[0]);
        req.body.images = req.body.images || {};
        req.body.images.background = { url: upload.secure_url, public_id: upload.public_id };
    }

    next();
});

const deleteFromCloudinary = async (public_id, resource_type = 'image') => {
    try {
        await cloudinary.uploader.destroy(public_id, { resource_type });
        return true;
    } catch (error) {
        // No lanzamos error para no detener el flujo principal, solo logueamos si fuera necesario
        console.error('Error eliminando imagen:', error);
        return false;
    }
};

const uploadMedia = fieldName => upload.single(fieldName);

module.exports = {
    processMedia,
    uploadMedia,
    deleteFromCloudinary,
    uploadGalleryFields,
    processGalleryMedia,
};
