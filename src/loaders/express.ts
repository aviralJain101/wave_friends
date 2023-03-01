import express, { NextFunction, Request, Response } from 'express';
import routes from '../api';
import config from './config';
import logger from './logger';
import httpContext from 'express-http-context';
import { v1 as uuidV1 } from 'uuid';
import errors from '../utils/errors';
import morgan from 'morgan';
import { isCelebrateError } from 'celebrate';
import { isBoolean, values } from 'lodash';

export default (app: express.Application): void => {
  /**
   * Health Check endpoints
   */
  app.get('/status', (req: Request, res: Response) => {
    res.status(200).json({ error: false, message: 'Healthy server!' });
  });
  app.head('/status', (req: Request, res: Response) => {
    res.status(200).end();
  });

  // Useful if you're behind a reverse proxy (Heroku, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable('trust proxy');

  // Uncomment below to enable Cross Origin Resource Sharing to all origins by default if needed
  // app.use(cors());

  // Security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.set({
      'Cache-Control': 'no-store', // response may not be stored in any cache
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'", // no default trusted sources
      'Expect-CT': 'max-age=86400, enforce', // enforces certificate timestamp, will be obsolete in June 2021
      'Referrer-Policy': 'strict-origin', // limits referrer security level to HTTPS→HTTPS only
      'Strict-Transport-Security': 'max-age=63072000', // browsers to remember to access via HTTPS only for 2 years
      'X-XSS-Protection': '1; mode=block', // prevents rendering pages when cross-site scripting attack detected
      'X-Content-Type-Options': 'nosniff', // blocks request if style/script mime-types are incorrect
      'X-Frame-Options': 'DENY', // prevents attempts to load the page in a frame
    });
    next();
  });

  app.use(
    morgan((tokens: morgan.TokenIndexer, req: Request, res: Response): string => {
      req.log.responseTime = parseFloat(tokens['response-time'](req, res) || '0');
      req.log.status = parseInt(tokens.status(req, res) || '0');
      if (config.nodeEnv === 'local' || config.nodeEnv === 'test') {
        return JSON.stringify(req.log, null, 2);
      } else {
        return JSON.stringify(req.log);
      }
    }),
  );

  // Middleware that transforms the raw string of req.body into json
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded into JSON body

  // Cross-service unique request ID set-up (for correlation)
  app.use(httpContext.middleware);
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] ? req.headers['x-request-id'] : uuidV1();
    httpContext.set('requestId', requestId);
    res.setHeader('X-Request-ID', requestId);
    req.requestId = requestId;
    req.log = {
      requestId,
      type: 'request-log',
      url: req.path,
      method: req.method,
      queryParams: req.query,
      startTime: new Date(),
    };
    next();
  });

  /**
   * Set-up API response structure for clients
   * All JSON responses from API now have following structure:
   * {
   *   error: <boolean>,
   *   message: <string>,
   *   data: <Actual response data (JS Object)>
   * }
   */
  app.use((req: Request, res: Response, next: NextFunction) => {
    const oldSendFunction = res.send;
    res.send = data => {
      res.send = oldSendFunction; // avoids double-sending
      try {
        const responseData = JSON.parse(data);
        const responseMessage = responseData.message;
        delete responseData.message;
        if ('error' in responseData && isBoolean(responseData.error) && responseData.error) {
          req.log.error = true;
          req.log.errorMessage = responseMessage;
          return res.send({ error: true, message: responseMessage });
        } else {
          req.log.error = false;
          req.log.message = responseMessage;
          return res.send({ error: false, message: responseMessage, data: responseData });
        }
      } catch (error) {
        // For non JSON responses
        return res.send(data);
      }
    };
    next();
  });

  // Load API routes
  app.use(config.api.prefix, routes());

  //create 404 error if none of the routes match and forward to error handler
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.log.error = true;
    req.log.errorMessage = `Invalid URL: ${req.url}; method: ${req.method}`;
    logger.error(`Invalid URL: ${req.url}; method: ${req.method}`);
    const err = new errors.NotFoundError('Invalid URL');
    next(err);
  });

  //error handlers - should always be defined last

  // Handle expected errors
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    logger.error(`${err.name}: ${err.message}`);
    let errorHandled = false;

    if (isCelebrateError(err)) {
      req.log.error = true;
      const headersMessage = err.details.get('headers')?.message; // 'details' is a Map()
      const paramsMessage = err.details.get('params')?.message;
      const queryMessage = err.details.get('query')?.message;
      const bodyMessage = err.details.get('body')?.message;
      const errorMessage = headersMessage || paramsMessage || queryMessage || bodyMessage;
      res.status(400).json({ error: true, message: errorMessage || 'We were unable to validate your input' });
      errorHandled = true;
    }

    for (const expectedError of values(errors)) {
      if (err.name === expectedError.name) {
        req.log.error = true;
        req.log.errorMessage = err.message;
        res.status(err.status).json({ error: true, message: err.message });
        errorHandled = true;
      }
    }
    if (!errorHandled) {
      next(err); // forward to next error handler below
    }
  });

  // Handle all other errors
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack); // log complete stack for unknown errors
    req.log.error = true;
    req.log.errorMessage = err.stack;
    res.status(err.status || 500).json({ error: true, message: 'Something went wrong, please try again later' });
    // No next call needed after handling errors
  });
};
