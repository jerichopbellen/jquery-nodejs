const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Admin access only.' });
    }
    next();
  };
}