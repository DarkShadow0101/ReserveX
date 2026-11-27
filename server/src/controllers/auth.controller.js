const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AppError = require('../utils/errors');

// Helper to strip sensitive fields (like password hash) before sending user data
function sanitizeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role
  };
}

// Helper to sign JWT token with expiration
function generateToken(user) {
  return jwt.sign(
    {
      UserId: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Shared production-hardened cookie flags (cross-site HTTPS needs SameSite=None + Secure)
function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
}

async function RegisterUser(req, res, next) {
  try {
    // Do NOT read role from req.body so users cannot register themselves as 'owner'
    const { fullName, email, password } = req.body;

    // 1. Only check email for uniqueness (different people can share the same name)
    const isUserAlreadyExists = await userModel.findOne({ email });
    if (isUserAlreadyExists) {
      return next(new AppError('User Already Exists', 409));
    }

    // 2. Hash password
    const hash = await bcrypt.hash(password, 10);

    // 3. Create user (role defaults to 'customer' in User model)
    const user = await userModel.create({
      fullName,
      email,
      password: hash
    });

    // 4. Sign expiring token, set secure cookie, and return sanitized user + token
    const token = generateToken(user);

    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'User Registered Successfully',
      user: sanitizeUser(user),
      token
    });
  } catch (err) {
    next(err);
  }
}

async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return next(new AppError('Invalid Credentials', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid Credentials', 401));
    }

    const token = generateToken(user);

    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'User Logged in Successfully',
      user: sanitizeUser(user),
      token
    });
  } catch (err) {
    next(err);
  }
}

async function logoutUser(req, res) {
  const { maxAge, ...clearOpts } = getCookieOptions();
  res.clearCookie('token', clearOpts);

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}

async function getMe(req, res, next) {
  try {
    // req.user was already fetched and verified by authMiddleware (with password excluded)
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { RegisterUser, loginUser, logoutUser, getMe };
