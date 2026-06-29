const jwt = require('jsonwebtoken');

exports.isAuthenticatedUser = (req, res, next) => {
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
    
    // Set both 'id' and 'user_id' so it never breaks regardless of how your other controllers reference it
    req.user = { 
      id: decoded.id,
      user_id: decoded.id 
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};