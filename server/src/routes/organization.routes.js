const express = require('express');
const router = express.Router();

const organizationController = require('../controllers/organization.controller');
const eventController = require('../controllers/event.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireOrgRole } = require('../middleware/org.middleware');
const validate = require('../middleware/validate.middleware');
const { createOrgSchema, addMemberSchema } = require('../validators/organization.validator');
const { createEventSchema } = require('../validators/event.validator');

// Every organization route requires a logged-in user
router.use(authMiddleware);

// Create an organization & list my organizations
router.post('/', validate(createOrgSchema), organizationController.createOrganization);

// IMPORTANT: '/me' MUST be defined BEFORE '/:id' so Express doesn't treat "me" as an :id!
router.get('/me', organizationController.getMyOrganizations);

// Organization-scoped routes (enforced by requireOrgRole)
router.get('/:id', requireOrgRole('owner', 'staff'), organizationController.getOrganizationById);
router.get('/:id/members', requireOrgRole('owner', 'staff'), organizationController.getMembers);

// Events under organization (owner or staff)
router.get('/:id/events', requireOrgRole('owner', 'staff'), eventController.getOrganizationEvents);
router.post(
  '/:id/events',
  requireOrgRole('owner', 'staff'),
  validate(createEventSchema),
  eventController.createEvent
);

// Owner-only member management
router.post(
  '/:id/members',
  requireOrgRole('owner'),
  validate(addMemberSchema),
  organizationController.addMember
);
router.delete(
  '/:id/members/:userId',
  requireOrgRole('owner'),
  organizationController.removeMember
);

module.exports = router;
