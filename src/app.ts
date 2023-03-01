import express from 'express';
import config from './loaders/config';
import loaders from './loaders';

import logger from './loaders/logger';


const startServer = (): void => {
  logger.debug('Loading Express app!');
  const app = express();
  loaders(app);
  logger.debug('Express loaded!');
  app
    .listen(config.port, () => {
      logger.debug(`Server listening on port: ${config.port}!`);
    })
    .on('error', err => {
      logger.error(err);
      process.exit(1);
    });
};

startServer();