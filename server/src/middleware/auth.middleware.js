const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const AppError = require('../utils/errors');

async function authMiddleware(req, res, next) {
  try {
    let token;

    // 1. Check if token is in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. OR check if token is in Cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token was found in either place
    if (!token) {
      return next(new AppError('Unauthorized: No token provided', 401));
    }

    // 3. Verify the token (if invalid/expired, jwt.verify throws and errorHandler handles it!)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Fetch the real user from MongoDB (excluding password)
    const user = await userModel.findById(decoded.UserId || decoded.id).select('-password');
    if (!user) {
      return next(new AppError('User belonging to this token no longer exists', 401));
    }

    // 5. Attach the real MongoDB user to req.user!
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Role-based access control middleware (runs AFTER authMiddleware!)
// Example: router.get('/owner-only', authMiddleware, authorize('owner'), handler)
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized: Please log in first', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(`Forbidden: Access restricted to [${allowedRoles.join(', ')}]`, 403)
      );
    }

    next();
  };
}

module.exports = {
  authMiddleware,
  authorize
};
