import express from 'express';
import cors from 'cors';
import routes from '@/api';
import config from '@/config';
import { Result } from '@/api/util/result';
import Container from 'typedi';
import { Logger } from 'winston';
export default ({ app }: { app: express.Application }) => {
  const logger: Logger = Container.get('logger');
  /**
   * Health Check endpoints
   * @TODO Explain why they are here
   */
  app.get('/status', (req, res) => {
    res.status(200).json({ status: 'OK' });
  });
  app.head('/status', (req, res) => {
    res.status(200).end();
  });

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable('trust proxy');

  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // Some sauce that always add since 2014
  // "Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it."
  // Maybe not needed anymore ?
  app.use(require('method-override')());

  // Transforms the raw string of req.body into json
  app.use(express.json());
  // Load API routes
  app.use(config.api.prefix, routes());

  /// catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err['status'] = 404;
    next(err);
  });

  /// error handlers
  app.use((err, req, res, next) => {
    /**
     * Handles authorization errors
     */
    if (err.status === 401) {
      logger.warn('⚠️ warn: %o', err);
      res.status(err.status);
      return res.json(Result.error(err)).end();
    }

    /**
     * Handles multer errors
     */
    if (err.code == 'LIMIT_UNEXPECTED_FILE') {
      res.status(413);
      return res.json(Result.error('Exceeded the expected file limit'));
    }
    return next(err);
  });
  app.use((err, req, res, next) => {
    logger.error('🔥 error: %o', err);
    res.status(err.status || 500);
    res.json(Result.error(err));
  });
};
