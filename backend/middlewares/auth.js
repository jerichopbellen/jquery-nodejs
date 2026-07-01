const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.isAuthenticatedUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Login first to access this resource' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Login first to access this resource' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user still exists and is active
    const dbUser = await User.findByPk(decoded.id, {
      attributes: ['user_id', 'role', 'is_active']
    });

    if (!dbUser) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!dbUser.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact admin.'
      });
    }

    req.user = {
      id: dbUser.user_id,
      user_id: dbUser.user_id,
      role: dbUser.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};