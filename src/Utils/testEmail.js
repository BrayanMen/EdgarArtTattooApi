const {testEmail} = require('../Config/nodemailer');

const runEmailTest = async () => {
    try {
      console.log('Iniciando prueba de envío de email...');
      await testEmail();
      console.log('✅ Prueba de email completada exitosamente');
    } catch (error) {
      console.error('❌ Error en prueba de email:', error);
    }
  };

  module.exports = {
    runEmailTest
  }