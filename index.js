const server = require('./src/server');
require('dotenv').config()
const { env } = require('./src/Config/env');
const  logger  = require('./src/Utils/logger');
const connectDB = require('./src/Config/db');


const PORT = env.PORT || 3001;

(async () => {
  try {
      await connectDB();
      server.listen(PORT, () => {
          logger.info(`Servidor en modo ${env.NODE_ENV} en puerto ${PORT}`);
      });
  } catch (error) {
      logger.error('Error al iniciar el servidor:', error);
      process.exit(1);
  }
})();

