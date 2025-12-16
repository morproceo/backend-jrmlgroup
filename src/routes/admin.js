const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Application, User } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const goHighLevelService = require('../services/goHighLevel');

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// GET /api/admin/applications - List all applications with filters
router.get('/applications', async (req, res) => {
  try {
    const {
      status,
      position,
      search,
      page = 1,
      limit = 20,
      sortBy = 'submittedAt',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};

    // Filter by status
    if (status && status !== 'all') {
      where.status = status;
    }

    // Filter by position
    if (position && position !== 'all') {
      where.position = position;
    }

    // Search by name, email, or application ID
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { applicationId: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: applications } = await Application.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'createdAt']
      }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('List applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list applications'
    });
  }
});

// GET /api/admin/applications/:id - Get single application
router.get('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findOne({
      where: {
        [Op.or]: [
          { id },
          { applicationId: id }
        ]
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'createdAt', 'lastLoginAt']
      }]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get application'
    });
  }
});

// PUT /api/admin/applications/:id/status - Update application status
router.put('/applications/:id/status', [
  body('status').isIn(['pending', 'review', 'background', 'approved', 'rejected'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findOne({
      where: {
        [Op.or]: [
          { id },
          { applicationId: id }
        ]
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update status
    await application.update({
      status,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      ...(notes && { adminNotes: application.adminNotes ? `${application.adminNotes}\n\n${notes}` : notes })
    });

    // Sync status to GoHighLevel
    try {
      await goHighLevelService.updateContactStatus(application.ghlContactId, status);
    } catch (ghlError) {
      console.error('GoHighLevel status update error:', ghlError);
    }

    res.json({
      success: true,
      message: 'Application status updated',
      data: application
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
});

// PUT /api/admin/applications/:id/notes - Add admin notes
router.put('/applications/:id/notes', [
  body('notes').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { notes } = req.body;

    const application = await Application.findOne({
      where: {
        [Op.or]: [
          { id },
          { applicationId: id }
        ]
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${req.user.firstName} ${req.user.lastName}: ${notes}`;
    const updatedNotes = application.adminNotes
      ? `${application.adminNotes}\n\n${newNote}`
      : newNote;

    await application.update({ adminNotes: updatedNotes });

    res.json({
      success: true,
      message: 'Notes added',
      data: application
    });
  } catch (error) {
    console.error('Add notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add notes'
    });
  }
});

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalApplications,
      pendingCount,
      reviewCount,
      backgroundCount,
      approvedCount,
      rejectedCount,
      ownerOperatorCount,
      leaseOperatorCount
    ] = await Promise.all([
      Application.count(),
      Application.count({ where: { status: 'pending' } }),
      Application.count({ where: { status: 'review' } }),
      Application.count({ where: { status: 'background' } }),
      Application.count({ where: { status: 'approved' } }),
      Application.count({ where: { status: 'rejected' } }),
      Application.count({ where: { position: 'OO' } }),
      Application.count({ where: { position: 'LO' } })
    ]);

    // Recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = await Application.count({
      where: {
        submittedAt: { [Op.gte]: sevenDaysAgo }
      }
    });

    res.json({
      success: true,
      data: {
        total: totalApplications,
        byStatus: {
          pending: pendingCount,
          review: reviewCount,
          background: backgroundCount,
          approved: approvedCount,
          rejected: rejectedCount
        },
        byPosition: {
          ownerOperator: ownerOperatorCount,
          leaseOperator: leaseOperatorCount
        },
        recentApplications: recentCount
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stats'
    });
  }
});

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const where = {};

    if (role && role !== 'all') {
      where.role = role;
    }

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list users'
    });
  }
});

module.exports = router;
