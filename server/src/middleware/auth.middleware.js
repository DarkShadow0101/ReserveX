// src/middleware/auth.middleware.js
// Authentication and Role-Based Access Control (RBAC) middleware

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/db');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

/**
 * Verifies JWT Bearer token and attaches user information to req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid format (Bearer token required)');
    }

    const token = authHeader.split(' ')[1];

    // Verify token using secret from environment
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Fetch user from database to ensure account is active and has not been deleted
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('User belonging to this token no longer exists');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Checks if the authenticated user has one of the allowed global roles
 * @param {string[]} allowedRoles - Array of roles e.g. ['ORGANIZER_ADMIN', 'ORGANIZER_STAFF']
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Please authenticate first'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`)
      );
    }

    next();
  };
}

/**
 * Checks if the user is a member of the specified organization with an allowed role
 * Looks for orgId in req.params.orgId, req.params.organizationId, or req.body.organizationId
 * @param {string[]} allowedOrgRoles
 */
function authorizeOrgRole(...allowedOrgRoles) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Please authenticate first'));
      }

      const orgId = req.params.orgId || req.params.organizationId || req.body.organizationId;
      if (!orgId) {
        return next(new ForbiddenError('Organization ID is required for organization role check'));
      }

      // Check membership
      const membership = await prisma.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: req.user.id,
            organizationId: orgId
          }
        }
      });

      if (!membership || !allowedOrgRoles.includes(membership.role)) {
        return next(
          new ForbiddenError(`You do not have permission within this organization. Required: ${allowedOrgRoles.join(', ')}`)
        );
      }

      req.membership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  authenticate,
  authorize,
  authorizeOrgRole
};
