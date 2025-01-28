import multer from 'multer';
import cloudinary from 'cloudinary';
import sharp from 'sharp';
import { AppError } from '../Utils/AppError';

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const VIDEO_TYPES = ['video/mp4', 'video/mkv', 'video/avi'];
const TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!TYPES.includes(file.mimetype)) {
      return cb(new AppError(`Tipo de archivo no permitido. Tipos permitidos: ${TYPES.join(', ')}`, 400), false);
    }
    cb(null, true);
  }
});

const processImage = async (buffer) => {
  try {
    return await sharp(buffer)
      .resize(1920, 1080, { 
        fit: 'inside',
        withoutEnlargement: true 
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
      quality_analysis: true
    };

    cloudinary.v2.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) reject(new AppError('Error al subir archivo a Cloudinary', 500));
        else resolve(result);
      })
      .end(buffer);
  });
};

export const processMedia = (fieldName) => catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No se ha proporcionado ningún archivo', 400));
  }

  try {
    let uploadedFile;
    const isImage = IMAGE_TYPES.includes(req.file.mimetype);
    const isVideo = VIDEO_TYPES.includes(req.file.mimetype);

    if (isImage) {
      const processedImage = await processImage(req.file.buffer);
      uploadedFile = await uploadToCloudinary(processedImage, 'image');
    } else if (isVideo) {
      uploadedFile = await uploadToCloudinary(req.file.buffer, 'video');
    }

    req.body[fieldName] = {
      public_id: uploadedFile.public_id,
      url: uploadedFile.secure_url,
      resource_type: uploadedFile.resource_type,
      format: uploadedFile.format,
      ...(uploadedFile.duration && { duration: uploadedFile.duration }),
      ...(uploadedFile.width && { width: uploadedFile.width }),
      ...(uploadedFile.height && { height: uploadedFile.height })
    };

    next();
  } catch (error) {
    return next(new AppError(`Error procesando archivo: ${error.message}`, 500));
  }
});

export const deleteFromCloudinary = async (public_id, resource_type = 'image') => {
  try {
    await cloudinary.v2.uploader.destroy(public_id, { resource_type });
    return true;
  } catch (error) {
    throw new AppError('Error al eliminar archivo de Cloudinary', 500);
  }
};

export const uploadMedia = (fieldName) => upload.single(fieldName);