import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest } from '../types';

// ─── Token Utility ────────────────────────────────────────────────────────────

const signToken = (id: string, email: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');

  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

  return jwt.sign({ id, email }, secret, { expiresIn });
};

const sendTokenResponse = (
  res: Response,
  statusCode: number,
  token: string,
  message: string,
  data?: object
): void => {
  // HTTP-only cookie — JS cannot read this, protecting against XSS attacks
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  const response: ApiResponse = {
    success: true,
    message,
    data: { token, ...data },
  };

  res.status(statusCode).json(response);
};

// ─── Signup ───────────────────────────────────────────────────────────────────

export const signup = catchAsync(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Please provide name, email and password', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id.toString(), user.email);

    sendTokenResponse(res, 201, token, 'Account created successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  }
);

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = catchAsync(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Explicitly select password since we set select:false on the schema
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      // Deliberately vague — don't reveal whether email exists
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken(user._id.toString(), user.email);

    sendTokenResponse(res, 200, token, 'Logged in successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  }
);

// ─── Get Current User ─────────────────────────────────────────────────────────

export const getMe = catchAsync(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const user = await User.findById(req.user?.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  }
);

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = (_req: Request, res: Response): void => {
  // Overwrite the cookie with an expired one to clear it from the browser
  res.cookie('jwt', 'loggedout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};