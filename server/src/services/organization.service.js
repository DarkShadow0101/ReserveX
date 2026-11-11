const crypto = require('crypto');
const mongoose = require('mongoose');
const Organization = require('../models/organization.model');
const Membership = require('../models/membership.model');
const User = require('../models/user.model');
const AppError = require('../utils/errors');

// Helper to build a unique URL-safe slug (e.g. "TechFest 2026" -> "techfest-2026")
async function generateUniqueSlug(name) {
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  if (!baseSlug) {
    baseSlug = `org-${crypto.randomBytes(3).toString('hex')}`;
  }

  const existing = await Organization.findOne({ slug: baseSlug });
  if (!existing) {
    return baseSlug;
  }

  // Append short random suffix if another org already uses that slug
  const suffix = crypto.randomBytes(2).toString('hex');
  return `${baseSlug}-${suffix}`;
}

// Create Organization + Owner Membership inside a MongoDB Transaction
async function createOrganization(userId, { name, description }) {
  const slug = await generateUniqueSlug(name);
  const session = await mongoose.startSession();
  let createdOrg;

  try {
    await session.withTransaction(async () => {
      // Note: With { session }, Mongoose's Model.create() expects an array and returns an array
      const [org] = await Organization.create(
        [
          {
            name,
            slug,
            description: description || '',
            createdBy: userId
          }
        ],
        { session }
      );

      await Membership.create(
        [
          {
            user: userId,
            organization: org._id,
            role: 'owner'
          }
        ],
        { session }
      );

      createdOrg = org;
    });
  } finally {
    await session.endSession();
  }

  return createdOrg;
}

// Get all organizations the current user belongs to, along with their role in each
async function getMyOrganizations(userId) {
  const memberships = await Membership.find({ user: userId })
    .populate('organization')
    .sort({ createdAt: -1 });

  return memberships
    .filter((m) => m.organization !== null)
    .map((m) => ({
      organization: m.organization,
      role: m.role,
      joinedAt: m.createdAt
    }));
}

// Get details of one organization
async function getOrganizationById(orgId) {
  const organization = await Organization.findById(orgId);
  if (!organization) {
    throw new AppError('Organization not found', 404);
  }
  return organization;
}

// List all members of an organization (with user name & email)
async function getMembers(orgId) {
  const members = await Membership.find({ organization: orgId })
    .populate('user', 'fullName email')
    .sort({ createdAt: 1 });

  return members.map((m) => ({
    id: m._id,
    user: m.user,
    role: m.role,
    joinedAt: m.createdAt
  }));
}

// Add an existing registered user to the organization by email
async function addMember(orgId, { email, role }) {
  const targetUser = await User.findOne({ email }).select('fullName email');
  if (!targetUser) {
    throw new AppError('No registered user found with this email', 404);
  }

  const existingMembership = await Membership.findOne({
    user: targetUser._id,
    organization: orgId
  });

  if (existingMembership) {
    throw new AppError('User is already a member of this organization', 409);
  }

  const membership = await Membership.create({
    user: targetUser._id,
    organization: orgId,
    role:role,
  });

  return {
    id: membership._id,
    user: targetUser,
    role: membership.role,
    joinedAt: membership.createdAt
  };
}

// Remove a member from an organization (never allow removing the last owner)
async function removeMember(orgId, targetUserId) {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new AppError('Invalid user ID', 400);
  }

  const targetMembership = await Membership.findOne({
    user: targetUserId,
    organization: orgId
  });

  if (!targetMembership) {
    throw new AppError('Member not found in this organization', 404);
  }

  if (targetMembership.role === 'owner') {
    const ownerCount = await Membership.countDocuments({
      organization: orgId,
      role: 'owner'
    });

    if (ownerCount <= 1) {
      throw new AppError('Cannot remove the last owner of an organization', 400);
    }
  }

  await targetMembership.deleteOne();
}

module.exports = {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  getMembers,
  addMember,
  removeMember
};
