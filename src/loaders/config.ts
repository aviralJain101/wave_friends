import dotenv from 'dotenv';

// Set the NODE_ENV to 'local' by default, if not pre-loaded from file
process.env.NODE_ENV = process.env.NODE_ENV || 'local';

// File is loaded in local env only, for deployments it is pre-loaded into process through plugin
if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test') {
    const envFound = dotenv.config(); // imports .env file from root dir to process.env
    if (envFound.error) {
      console.log("Couldn't find .env file!");
      throw new Error("Couldn't find .env file!"); // This error should crash whole process
    }
}

// Required environment variables before proceeding


export default {
  nodeEnv: process.env.NODE_ENV,
  /**
   * Your favorite port
   */
  port: parseInt(process.env.PORT === undefined ? '3000' : process.env.PORT),

  /**
   * DB details
   */
  mongoDBUrl: process.env.MONGODB_URL, 
  /**
   * Used by winston logger
   */
  logs: {
      level: process.env.LOG_LEVEL || 'info',
  },

  /**
   * API configs
   */
  api: {
    prefix: '/api',
  },
};