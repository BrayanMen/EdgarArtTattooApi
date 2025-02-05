const nodemailer = require('nodemailer');
const {env} = require('../Config/env');
const {passwordResetHTML, emailVerificationHTML} = require('../Utils/emailTemplate');

const transporterCreate = ()=>{
    return nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        service: 'gmail',
        secure: env.EMAIL_PORT === 465,
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS
        }
    });
};

const sendPasswordReset = async(email, token)=>{
    const transporter = transporterCreate();
    const url = `${env.CLIENT_URLS}/resetPassword/${token}`;

    const emailOption = {
        from: env.EMAIL_USER,
        to: email,
        subject: 'Restablecimiento de Contraseña',
        html: passwordResetHTML(url, env.COMPANY_NAME, env.SUPPORT_EMAIL)
    }
    await transporter.sendMail(emailOption);
};

const sendVerifyEmail = async (email, token) => {
    const transporter = transporterCreate();
    const url = `${env.CLIENT_URL}/verifyEmail/${token}`;

    const emailOption = {
        from: env.EMAIL_USER,
        to: email,
        subject: 'Verificación de Correo Electrónico',
        html: emailVerificationHTML(url, env.COMPANY_NAME, env.SUPPORT_EMAIL)
    }
    await transporter.sendMail(emailOption);
};

const testEmail = async () => {
    try {
        await sendPasswordReset('brayanjmr880@gmail.com', 'test-token');
        console.log('Email de prueba enviado correctamente');
    } catch (error) {
        console.error('Error al enviar email:', error);
    }
};

module.exports = {
    sendPasswordReset,
    sendVerifyEmail,
    testEmail
}