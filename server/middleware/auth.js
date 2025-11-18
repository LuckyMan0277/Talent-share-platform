const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '사용자를 찾을 수 없습니다'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: '인증이 유효하지 않습니다'
    });
  }
};

// Check if user owns the resource
exports.checkOwnership = (Model) => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: '리소스를 찾을 수 없습니다'
        });
      }

      // Check if user owns the resource
      if (resource.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: '권한이 없습니다'
        });
      }

      // Attach resource to request
      req.resource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };
};
