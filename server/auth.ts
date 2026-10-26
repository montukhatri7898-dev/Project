import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserDoc } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'imovies_super_secure_jwt_secret_key_2026';

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export function signToken(user: UserDoc): string {
  const payload: AuthPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function sanitizeUser(user: UserDoc) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    preferredCity: user.preferredCity,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.imovies_token) {
    token = req.cookies.imovies_token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    return next();
  } catch (err) {
    // Invalid or expired token
    return next();
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to continue.',
    });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Administrator privileges are required for this action.',
    });
  }
  next();
}
