import { cleanEnv, str, num, url } from 'envalid';

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production'] }),
  PORT: num({ default: 3001 }),
  MONGO_URI: str(),
  JWT_SECRET: str(),
  CLOUD_NAME: str(),
  CLOUD_API_KEY: str(),
  CLOUD_API_SECRET: str(),
  CLIENT_URLS: str({ default: 'http://localhost:3000' }),
  MERCADOLIBRE_API_KEY: str()
});

export const validateEnv = () => {
  if (process.env.NODE_ENV === 'production') {
    env.isProduction;
  }
};
