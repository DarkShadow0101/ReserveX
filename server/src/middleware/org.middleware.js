const mongoose = require('mongoose');
const Membership = require('../models/membership.model');
const AppError = require('../utils/errors');

// Organization-level Authorization Middleware (MUST run AFTER authMiddleware)
// Enforces multi-tenant isolation: verifies req.user belongs to the target org with an allowed role
function requireOrgRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AppError('Unauthorized: Please log in first', 401));
      }

      const orgId = req.params.orgId || req.params.id;
      if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        return next(new AppError('Invalid organization ID', 400));
      }

      // Check Membership for THIS exact user (from JWT) and THIS exact organization
      const membership = await Membership.findOne({
        user: req.user._id,
        organization: orgId
      });

      if (!membership) {
        return next(new AppError('Forbidden: You do not belong to this organization', 403));
      }

      if (!allowedRoles.includes(membership.role)) {
        return next(
          new AppError(
            `Forbidden: Organization access restricted to [${allowedRoles.join(', ')}]`,
            403
          )
        );
      }

      // Attach membership & orgId for downstream controllers/services
      req.membership = membership;
      req.organizationId = orgId;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  requireOrgRole
};
