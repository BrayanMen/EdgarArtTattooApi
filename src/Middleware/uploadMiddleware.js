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

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const VIDEO_TYPES = ['video/mp4', 'video/mkv', 'video/avi', 'video/webm'];
const THREED_TYPES = ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'];
const TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES, ...THREED_TYPES];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // Aumentamos a 50MB para videos/3D de alta calidad
    },
    fileFilter: (req, file, cb) => {
        // Validación básica, para 3D a veces el mimetype varía según el OS, sé permisivo con la extensión si es necesario
        if (TYPES.includes(file.mimetype) || file.originalname.match(/\.(glb|gltf|obj)$/)) {
            cb(null, true);
        } else {
            cb(new AppError(`Tipo de archivo no permitido.`, 400), false);
        }
    },
});

const uploadGalleryFields = upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'secondaryImage', maxCount: 1 },
    { name: 'backgroundImage', maxCount: 1 },
]);

const processGalleryMedia = catchAsync(async (req, res, next) => {
    if (!req.files) return next();

    // Función helper para procesar y subir
    const processAndUpload = async fileBuffer => {
        const processed = await processImage(fileBuffer); // Tu función existente de sharp
        return await uploadToCloudinary(processed, 'image'); // Tu función existente
    };

    // Procesamos main
    if (req.files.mainImage) {
        const upload = await processAndUpload(req.files.mainImage[0].buffer);
        // Asignamos a la estructura del body que espera el modelo
        req.body.images = req.body.images || {};
        req.body.images.main = { url: upload.secure_url, public_id: upload.public_id };
    }

    // Procesamos secondary
    if (req.files.secondaryImage) {
        const upload = await processAndUpload(req.files.secondaryImage[0].buffer);
        req.body.images = req.body.images || {};
        req.body.images.secondary = { url: upload.secure_url, public_id: upload.public_id };
    }

    // Procesamos background
    if (req.files.backgroundImage) {
        // A veces el fondo no necesita resize o necesita uno diferente, pero por ahora estandarizamos
        const upload = await processAndUpload(req.files.backgroundImage[0].buffer);
        req.body.images = req.body.images || {};
        req.body.images.background = { url: upload.secure_url, public_id: upload.public_id };
    }

    next();
});

const processImage = async buffer => {
    try {
        return await sharp(buffer)
            .resize(1920, 1080, {
                fit: 'inside',
                withoutEnlargement: true,
            })
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
            quality_analysis: true,
        };

        cloudinary.v2.uploader
            .upload_stream(uploadOptions, (error, result) => {
                if (error) reject(new AppError('Error al subir archivo a Cloudinary', 500));
                else resolve(result);
            })
            .end(buffer);
    });
};

const processMedia = fieldName =>
    catchAsync(async (req, res, next) => {
        if (!req.file) return next();

        try {
            let uploadedFile;
            const isImage = IMAGE_TYPES.includes(req.file.mimetype);
            const isVideo = VIDEO_TYPES.includes(req.file.mimetype);
            // Detectar 3D por extensión o mimetype
            const is3D =
                file.originalname.match(/\.(glb|gltf|obj)$/) ||
                THREED_TYPES.includes(req.file.mimetype);

            if (isImage) {
                // Optimizamos imágenes 2D
                const processedImage = await processImage(req.file.buffer);
                uploadedFile = await uploadToCloudinary(processedImage, 'image');
            } else if (isVideo) {
                // Videos se suben directos (resource_type: video)
                uploadedFile = await uploadToCloudinary(req.file.buffer, 'video');
            } else if (is3D) {
                // 3D se sube como 'image' o 'raw' en Cloudinary dependiendo del formato, 'raw' es más seguro para .glb
                uploadedFile = await uploadToCloudinary(req.file.buffer, 'raw');
            }

            req.body[fieldName] = {
                public_id: uploadedFile.public_id,
                url: uploadedFile.secure_url,
                resource_type: uploadedFile.resource_type,
                format: uploadedFile.format,
            };
            next();
        } catch (error) {
            return next(new AppError(`Error procesando archivo: ${error.message}`, 500));
        }
    });

const deleteFromCloudinary = async (public_id, resource_type = 'image') => {
    try {
        await cloudinary.v2.uploader.destroy(public_id, { resource_type });
        return true;
    } catch (error) {
        throw new AppError('Error al eliminar archivo de Cloudinary', 500);
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
