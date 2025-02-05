const catchAsync = (fn) => (req, res, next) => {
    fn(req, res, next)
      .catch((err) => {
        logger.error(`Error en ${req.method} ${req.path}: ${err.message}`);
        next(err);
      });
  };

  module.exports = catchAsync;