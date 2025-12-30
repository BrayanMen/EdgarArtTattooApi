const {testEmail} = require('../Config/nodemailer');
const { logger } = require('./logger');

const runEmailTest = async () => {
    try {
      logger.info('Iniciando prueba de envío de email...');
      await testEmail();
      logger.info('✅ Prueba de email completada exitosamente');
    } catch (error) {
      logger.error('❌ Error en prueba de email:', error);
    }
  };

  module.exports = {
    runEmailTest
  }