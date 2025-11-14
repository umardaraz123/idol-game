import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Generate JWT token
export const generateToken = (adminId) => {
  return jwt.sign(
    { adminId }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '7d',
      issuer: 'idolbe-api',
      audience: 'idolbe-admin'
    }
  );
};

// Verify JWT token middleware
export const authenticateAdmin = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find admin in database
      const admin = await Admin.findById(decoded.adminId).select('-password');
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Admin not found.'
        });
      }

      if (!admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Admin account is deactivated.'
        });
      }

      // Add admin to request object
      req.admin = admin;
      next();

    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Token has expired.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Invalid token.',
          code: 'INVALID_TOKEN'
        });
      }
      
      throw jwtError;
    }

  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Check specific permissions middleware
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Super admin has all permissions
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // Check if admin has specific permission
    if (!req.admin.permissions || !req.admin.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${permission} permission required.`,
        requiredPermission: permission,
        userPermissions: req.admin.permissions
      });
    }

    next();
  };
};

// Check if user is super admin
export const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }

  next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.adminId).select('-password');
        
        if (admin && admin.isActive) {
          req.admin = admin;
        }
      } catch (jwtError) {
        // Token invalid, but we continue without auth
        console.log('Invalid token in optional auth:', jwtError.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue even if there's an error
  }
};