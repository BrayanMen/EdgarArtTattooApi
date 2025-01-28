import { catchAsync } from '../Utils/catchAsync';
import User from '../Models/User';
import  AppError  from '../Utils/AppError';
import jwt from 'jsonwebtoken';
import { uploadMedia, processMedia, deleteFromCloudinary } from '../Middleware/uploadMiddleware';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('El email ya está registrado', 400));
  }

  const newUser = await User.create({
    ...req.body,
    authProvider: 'local'
  });

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Por favor proporcione email y contraseña', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Email o contraseña incorrectos', 401));
  }

  createSendToken(user, 200, res);
});

export const socialLogin = catchAsync(async (req, res, next) => {
  const { email, fullName, image, socialId, authProvider } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      fullName,
      image,
      socialId,
      authProvider,
      role: 'client'
    });
  } else if (user.authProvider !== authProvider) {
    return next(new AppError(`Esta cuenta está registrada con ${user.authProvider}`, 400));
  }

  createSendToken(user, 200, res);
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const allowedUpdates = ['fullName', 'email', 'socialLinks'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return next(new AppError('Actualizaciones no válidas', 400));
  }

  const user = await User.findById(req.user.id);
  
  updates.forEach(update => user[update] = req.body[update]);
  await user.save();

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const updateProfileImage = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.image?.public_id) {
    await deleteFromCloudinary(user.image.public_id);
  }

  user.image = req.body.image;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Contraseña actual incorrecta', 401));
  }

  user.password = newPassword;
  await user.save();

  createSendToken(user, 200, res);
});

export const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Admin 
export const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No se encontró el usuario', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const allowedUpdates = ['fullName', 'email', 'role', 'active'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return next(new AppError('Actualizaciones no válidas', 400));
  }

  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('No se encontró el usuario', 404));
  }

  updates.forEach(update => user[update] = req.body[update]);
  await user.save();

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No se encontró el usuario', 404));
  }

  if (user.image?.public_id) {
    await deleteFromCloudinary(user.image.public_id);
  }

  await user.remove();

  res.status(204).json({
    status: 'success',
    data: null
  });
});