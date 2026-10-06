/**
 * JWT Auth middleware for admin routes
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.ubr_admin_token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized — no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized — invalid token' });
  }
};
