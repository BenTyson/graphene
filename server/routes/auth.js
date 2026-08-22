import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: username.toLowerCase() }
        ],
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const tokenExpiry = rememberMe ? '30d' : JWT_EXPIRES_IN;
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Return success with token and user info
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', (req, res) => {
  // Since we're using stateless JWT tokens, logout is handled client-side
  // This endpoint exists for consistency and future token blacklisting
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        lastLogin: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Middleware to authenticate JWT token
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      code: 'TOKEN_MISSING'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // 401, not 403. 403 means "authenticated but not permitted" — that is what
      // requireEditAccess / requireSuperAdmin below return. A bad or expired token
      // is an *authentication* failure, and now that reads require a token too
      // (DECISIONS.md D-006) the client needs to be able to tell the two apart so
      // an expired session re-prompts for login instead of surfacing as a
      // permission error on every read.
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
      });
    }

    req.user = user;
    next();
  });
}

/**
 * Middleware to check if user has super admin role
 */
export function requireSuperAdmin(req, res, next) {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Super admin access required'
    });
  }
  next();
}

/**
 * Middleware to check if user can edit (not THIRD_PARTY)
 */
export function requireEditAccess(req, res, next) {
  if (req.user.role === 'THIRD_PARTY') {
    return res.status(403).json({
      success: false,
      error: 'View-only access. Editing is not permitted for your account.'
    });
  }
  next();
}

export default router;