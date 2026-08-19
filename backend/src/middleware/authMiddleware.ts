import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';

const JWT_SECRET = process.env.JWT_SECRET || 'eventbridge_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Proceed as guest
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userRepo = new UserRepository();
    const fullUser = await userRepo.findById(decoded.userId);
    if (fullUser && fullUser.status === 'ACTIVE') {
      const { passwordHash, ...userWithoutPassword } = fullUser;
      req.user = userWithoutPassword;
    }
  } catch (err) {
    // Invalid token, proceed as guest
  }
  next();
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions for this role.' });
    }
    next();
  };
};
