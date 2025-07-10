import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(__dirname, "../../../.env") }); // Path to root .env

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required env var: ${key}`);
  }
  return value;
};

// Application configuration
export interface AppConfig {
  env: string;
  port: number;
  frontendPort: number;
  frontendUrl: string;
  mongo: {
    uri: string;
    rootUsername: string;
    rootPassword: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
  };
  jwt: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  bullBoard: {
    username: string;
    password: string;
  };
}

const appConfig: AppConfig = {
  env: required("NODE_ENV"),
  port: parseInt(required("PORT"), 10),
  frontendPort: parseInt(required("FRONTEND_PORT"), 10),
  frontendUrl: required("FRONTEND_URL"),
  mongo: {
    uri: required("MONGODB_URI"),
    rootUsername: required("MONGODB_ROOT_USERNAME"),
    rootPassword: required("MONGODB_ROOT_PASSWORD"),
  },
  redis: {
    host: required("REDIS_HOST"),
    port: parseInt(required("REDIS_PORT"), 10),
    password: required("REDIS_PASSWORD"),
  },
  jwt: {
    accessTokenSecret: required("JWT_ACCESS_SECRET"),
    refreshTokenSecret: required("JWT_REFRESH_SECRET"),
    accessExpiresIn: required("JWT_ACCESS_EXPIRES_IN"),
    refreshExpiresIn: required("JWT_REFRESH_EXPIRES_IN"),
  },
  bullBoard: {
    username: required("BULL_BOARD_USERNAME"),
    password: required("BULL_BOARD_PASSWORD"),
  },
};

export default appConfig;
