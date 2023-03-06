import isAuth, { isOfficerAuth, isAdminAuth } from './isAuth';
import rateLimit from './rateLimit';
import upload from './upload';

export default {
  isAuth,
  rateLimit,
  upload,
  isOfficerAuth,
  isAdminAuth,
};
