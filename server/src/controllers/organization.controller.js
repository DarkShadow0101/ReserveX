const organizationService = require('../services/organization.service');

// POST /api/organizations
async function createOrganization(req, res, next) {
  try {
    const organization = await organizationService.createOrganization(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: { organization }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/organizations/me
async function getMyOrganizations(req, res, next) {
  try {
    const organizations = await organizationService.getMyOrganizations(req.user._id);

    res.status(200).json({
      success: true,
      data: { organizations }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/organizations/:id
async function getOrganizationById(req, res, next) {
  try {
    const organization = await organizationService.getOrganizationById(req.organizationId);

    res.status(200).json({
      success: true,
      data: {
        organization,
        myRole: req.membership.role
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/organizations/:id/members
async function getMembers(req, res, next) {
  try {
    const members = await organizationService.getMembers(req.organizationId);

    res.status(200).json({
      success: true,
      data: { members }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/organizations/:id/members
async function addMember(req, res, next) {
  try {
    const member = await organizationService.addMember(req.organizationId, req.body);

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: { member }
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/organizations/:id/members/:userId
async function removeMember(req, res, next) {
  try {
    await organizationService.removeMember(req.organizationId, req.params.userId);

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  getMembers,
  addMember,
  removeMember
};
