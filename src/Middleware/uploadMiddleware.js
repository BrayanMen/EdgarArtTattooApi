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
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new AppError('Solo se permiten imágenes', 400), false);
  }
});

export const processImage = (fieldName) => catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  
  const processedImage = await sharp(req.file.buffer)
    .resize(1920, 1080, { fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();

  const result = await new Promise((resolve, reject) => {
    cloudinary.v2.uploader
      .upload_stream({ resource_type: 'image' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(processedImage);
  });

  req.body[fieldName] = {
    public_id: result.public_id,
    url: result.secure_url
  };
  
  next();
});

export const uploadImage = (fieldName) => upload.single(fieldName);