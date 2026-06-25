import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, catchAsync } from './errorHandler';
import { AuthenticatedRequest } from '../types';

interface JwtPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export const protect = catchAsync(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    // 1. Check for token in Authorization header OR cookie
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new AppError('You are not logged in. Please log in to get access.', 401);
    }

    // 2. Verify the token is valid and not expired
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError('JWT_SECRET is not defined', 500);

    const decoded = jwt.verify(token, secret) as JwtPayload;

    // 3. Attach the user payload to the request for downstream controllers
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  }
);