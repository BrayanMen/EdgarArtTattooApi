import multer from 'multer';
import cloudinary from 'cloudinary';
import sharp from 'sharp';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mkv', 'video/avi'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new AppError('Solo se permiten imágenes y videos', 400), false);
  }
});

export const processMedia = (fieldName) => catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  let uploadedFile;

  if (req.file.mimetype.startsWith('image')) {
    const processedImage = await sharp(req.file.buffer)
      .resize(1920, 1080, { fit: 'inside' })
      .webp({ quality: 80 })
      .toBuffer();

    uploadedFile = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(processedImage);
    });
  } else if (req.file.mimetype.startsWith('video')) {
    uploadedFile = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream({ resource_type: 'video' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(req.file.buffer);
    });
  }

  req.body[fieldName] = {
    public_id: uploadedFile.public_id,
    url: uploadedFile.secure_url
  };

  next();
});

export const uploadMedia = (fieldName) => upload.single(fieldName);