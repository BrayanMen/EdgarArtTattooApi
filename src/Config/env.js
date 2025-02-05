const { cleanEnv, str, num, url } = require('envalid');

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  PORT: num({ default: 3001 }),
  MONGO_URI: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: '7d' }),
  CLOUD_NAME: str(),
  CLOUD_API_KEY: str(),
  CLOUD_API_SECRET: str(),
  EMAIL_HOST:str(),
  EMAIL_PORT:num({ default: 587 }),
  EMAIL_USER:str(),
  EMAIL_PASS:str(),
  COMPANY_NAME:str(),
  SUPPORT_EMAIL:str(),
  CLIENT_URLS: str(),
  MERCADOLIBRE_API_KEY: str()
});

const validateEnv = () => {
  if (process.env.NODE_ENV === 'production') {
    env.isProduction;
  }
};

module.exports = { env, validateEnv };
