import dayjs from 'dayjs';
import express from 'express';
import logger from './logger';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc'; // dependent on utc plugin
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import loadInterceptors from './interceptors';
import getDbClient from './database';
import expressLoader from './express';

export default (app: express.Application): void => {
  // TODO: Add why we are doing below
  dayjs.extend(localizedFormat);
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(relativeTime);
  dayjs.tz.setDefault('Asia/Kolkata');

  // Load database connection client
  getDbClient();
  logger.debug('Database loaded');

  //Load Express
  expressLoader(app);
  logger.debug('Express Initialized');

  // TODO: Load database connections, queues, object stores and other resource connections as needed

  // Common functionality for all axios requests in this project
  loadInterceptors();
  logger.debug('Interceptors loaded');
};