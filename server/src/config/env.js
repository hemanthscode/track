import Joi from "joi";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validation schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().default(3000),
  
  MONGODB_URI: Joi.string().required().description("MongoDB connection string"),
  MONGODB_TEST_URI: Joi.string().optional(),
  
  JWT_SECRET: Joi.string().min(32).required().description("JWT secret key"),
  JWT_ACCESS_EXPIRY: Joi.string().default("15m"),
  JWT_REFRESH_EXPIRY: Joi.string().default("7d"),
  
  GROQ_API_KEY: Joi.string().required().description("Groq API key"),
  GROQ_MODEL: Joi.string().default("llama-3.3-70b-versatile"),
  
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  
  EMAIL_HOST: Joi.string().default("smtp.gmail.com"),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_SECURE: Joi.boolean().default(false),
  EMAIL_USER: Joi.string().email().required(),
  EMAIL_PASSWORD: Joi.string().required(),
  EMAIL_FROM: Joi.string().required(),
  
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  LOGIN_RATE_LIMIT_MAX: Joi.number().default(5),
  
  MAX_FILE_SIZE: Joi.number().default(5242880),
  ALLOWED_FILE_TYPES: Joi.string().default("image/jpeg,image/png,image/jpg"),
  
  FRONTEND_URL: Joi.string().uri().default("http://localhost:5173"),
  LOG_LEVEL: Joi.string().valid("error", "warn", "info", "debug").default("info"),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Export validated config
export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  
  database: {
    uri: envVars.NODE_ENV === "test" ? envVars.MONGODB_TEST_URI : envVars.MONGODB_URI,
  },
  
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpiry: envVars.JWT_ACCESS_EXPIRY,
    refreshExpiry: envVars.JWT_REFRESH_EXPIRY,
  },
  
  groq: {
    apiKey: envVars.GROQ_API_KEY,
    model: envVars.GROQ_MODEL,
  },
  
  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
  
  email: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    secure: envVars.EMAIL_SECURE,
    auth: {
      user: envVars.EMAIL_USER,
      pass: envVars.EMAIL_PASSWORD,
    },
    from: envVars.EMAIL_FROM,
  },
  
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
    loginMax: envVars.LOGIN_RATE_LIMIT_MAX,
  },
  
  upload: {
    maxSize: envVars.MAX_FILE_SIZE,
    allowedTypes: envVars.ALLOWED_FILE_TYPES.split(","),
  },
  
  frontend: {
    url: envVars.FRONTEND_URL,
  },
  
  logging: {
    level: envVars.LOG_LEVEL,
  },
};

export default config;
