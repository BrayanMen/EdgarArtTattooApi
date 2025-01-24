import jwt from 'jsonwebtoken';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';


export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) throw new AppError('Acceso no autorizado', 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  
  if (!user) throw new AppError('Usuario ya no existe', 401);
  
  req.user = user;
  next();
});

export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new AppError('No tienes permiso para esta acción', 403);
  }
  next();
};