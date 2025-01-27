export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
      console.error('Error:', err);
      return res.status(statusCode).json({
          status,
          message: err.message,
          stack: err.stack,
      });
  }

  if (process.env.NODE_ENV === 'production') {
      if (err.isOperational) {
          return res.status(statusCode).json({
              status,
              message: err.message,
          });
      }

      console.error('Error:', err);

      return res.status(500).json({
          status: 'error',
          message: 'Algo salió mal en el servidor.',
      });
  }
};