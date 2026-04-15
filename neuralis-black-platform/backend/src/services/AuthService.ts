import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
}

export class AuthService {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    if (!config.jwtSecret || config.jwtSecret.length < 16) {
      throw new Error('JWT secret must be at least 16 characters long');
    }
    this.config = config;
  }

  generateToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.jwtExpiresIn,
    });
  }

  verifyToken(token: string): TokenPayload {
    if (!token) {
      throw new Error('Token is required');
    }

    try {
      const decoded = jwt.verify(token, this.config.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  decodeToken(token: string): TokenPayload | null {
    if (!token) {
      return null;
    }

    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      this.verifyToken(token);
      return false;
    } catch (error) {
      if (error instanceof Error && error.message === 'Token has expired') {
        return true;
      }
      throw error;
    }
  }
}
