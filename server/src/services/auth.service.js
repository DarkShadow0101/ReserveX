// src/services/auth.service.js
// Business logic for user registration, authentication, and retrieval

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Helper to generate a signed JWT token
 * @param {object} payload - { userId, email, role }
 */
function generateToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

/**
 * Register a new user
 * @param {object} data - { email, password, fullName, role }
 */
async function registerUser({ email, password, fullName, role = 'CUSTOMER' }) {
  // Check if an account already exists with this email
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ConflictError('A user with this email address already exists');
  }

  // Hash password using bcrypt
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // Store user in database
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true
    }
  });

  // Issue authentication token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  return { user, token };
}

/**
 * Authenticate a user with email and password
 * @param {object} data - { email, password }
 */
async function loginUser({ email, password }) {
  // Look up user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  // To prevent account enumeration attacks, use the same generic error message
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Compare submitted plain password with stored bcrypt hash
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Issue authentication token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt
    },
    token
  };
}

/**
 * Fetch profile of current authenticated user, including organization memberships
 * @param {string} userId
 */
async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      memberships: {
        select: {
          id: true,
          role: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    throw new NotFoundError('User profile not found');
  }

  return user;
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
