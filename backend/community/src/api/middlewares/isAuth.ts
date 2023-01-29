import { Jwt, JwtPayload, verify } from 'jsonwebtoken';
import config from '@/config';
import { Logger } from 'winston';
import Container from 'typedi';
import { IToken } from '@/interfaces/IToken';
import { INextFunction, IRequest, IResponse } from '@/api/types/express';

const getTokenFromHeader = (req): string => {
  if (
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

export const checkToken = (token: string, isAuth = true): IToken => {
  const logger: Logger = Container.get('logger');
  if (!token && isAuth)
    throw { status: 401, message: 'This is an authenticated resource, you must be logged in to access it.' };
  try {
    const decoded = verify(token, config.jwtSecret, { algorithms: [config.jwtAlgorithm] });
    return decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      /** @TODO here, we reissue the token using the refresh token from the database  */
    }

    logger.error('🔥 Error in verifying token: %o', err);
    throw err;
  }
};

const isAuth = async (req: IRequest, res: IResponse, next: INextFunction) => {
  const logger: Logger = Container.get('logger');

  try {
    const tokenFromHeader = getTokenFromHeader(req);
    const token = checkToken(tokenFromHeader);
    logger.debug('User authenticated %o', token);

    req.currentUser = token;
    return next();
  } catch (e) {
    return next(e);
  }
};

export default isAuth;
