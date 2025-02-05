const passwordResetHTML = (resetURL, companyName = 'Edgar Art Tattoo', supportEmail = 'edgar.art.tattoo.citas@gmail.com') => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Recuperación de Contraseña</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #121212;
            color: #e0e0e0;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .email-container {
            background-color: #1e1e1e;
            border-radius: 8px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 1px solid #2c2c2c;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #f0f0f0;
            margin: 0;
            font-size: 22px;
            font-weight: 500;
            letter-spacing: 1px;
        }
        .button {
            display: block;
            width: 100%;
            padding: 14px;
            background-color: #333;
            color: #fff;
            text-align: center;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            transition: background-color 0.3s ease;
            border: 1px solid #444;
        }
        .button:hover {
            background-color: #444;
        }
        .content {
            text-align: center;
            margin-bottom: 30px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #888;
            border-top: 1px solid #2c2c2c;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Recuperación de Contraseña</h1>
        </div>
        <div class="content">
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p>Haz clic en el botón de abajo para continuar con el proceso de recuperación:</p>
            <a href="${resetURL}" class="button">Restablecer Contraseña</a>
            <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
            <p>Este enlace será válido por los próximos 60 minutos.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${companyName}. Todos los derechos reservados.
            <p>Problemas? Contacta a soporte: ${supportEmail}</p>
        </div>
    </div>
</body>
</html>
`;

const emailVerificationHTML = (verificationURL, companyName = 'Edgar Art Tattoo', supportEmail = 'edgar.art.tattoo.citas@gmail.com') => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Verificación de Email</title>
    <style>        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #121212;
            color: #e0e0e0;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .email-container {
            background-color: #1e1e1e;
            border-radius: 8px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 1px solid #2c2c2c;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #f0f0f0;
            margin: 0;
            font-size: 22px;
            font-weight: 500;
            letter-spacing: 1px;
        }
        .button {
            display: block;
            width: 100%;
            padding: 14px;
            background-color: #333;
            color: #fff;
            text-align: center;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            transition: background-color 0.3s ease;
            border: 1px solid #444;
        }
        .button:hover {
            background-color: #444;
        }
        .content {
            text-align: center;
            margin-bottom: 30px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #888;
            border-top: 1px solid #2c2c2c;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Verificación de Email</h1>
        </div>
        <div class="content">
            <p>¡Gracias por registrarte! Por favor verifica tu dirección de email.</p>
            <p>Haz clic en el botón de abajo para verificar tu cuenta:</p>
            <a href="${verificationURL}" class="button">Verificar Email</a>
            <p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
            <p>Este enlace será válido por los próximos 24 horas.</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} ${companyName}. Todos los derechos reservados.
            <p>Problemas? Contacta a soporte: ${supportEmail}</p>
        </div>
    </div>
</body>
</html>
`;

module.exports = {
    passwordResetHTML,
    emailVerificationHTML
};