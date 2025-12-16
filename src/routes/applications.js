const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const goHighLevelService = require('../services/goHighLevel');

// Try to load models (may fail if DB not connected)
let Application, User, dbAvailable = false;
try {
  const models = require('../models');
  Application = models.Application;
  User = models.User;
  dbAvailable = true;
} catch (e) {
  console.warn('Models not available, running in webhook-only mode');
}

// Validation for application submission
const validateApplication = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('position').isIn(['OO', 'LO']).withMessage('Position must be OO or LO')
];

// POST /api/applications - Submit new application
router.post('/', validateApplication, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      email, password, firstName, lastName, phone, position,
      dateOfBirth, ssn, startDate, streetAddress, city, state, zipCode,
      cdlNumber, cdlState, cdlClass, licenseExpiration, endorsements, hasTWIC, twicExpiration,
      yearsExperience, hasAccidents, accidentDetails, hasViolations, violationDetails, hasDUI, duiDetails,
      employer1Name, employer1Phone, employer1Position, employer1StartDate, employer1EndDate, employer1ReasonLeaving,
      employer2Name, employer2Phone, employer2Position, employer2StartDate, employer2EndDate, employer2ReasonLeaving,
      hasOwnTruck, truckYear, truckMake, truckModel, truckVIN, hasTrailer, trailerType, trailerLength,
      ref1Name, ref1Phone, ref1Relationship, ref2Name, ref2Phone, ref2Relationship,
      certifyTrue, authorizeContact, electronicSignature
    } = req.body;

    // Generate application ID
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    const applicationId = `JRML-${year}-${random}`;
    const submittedAt = new Date().toISOString();

    // Build application object for webhook
    const applicationData = {
      applicationId,
      status: 'pending',
      submittedAt,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      position,
      dateOfBirth,
      startDate,
      streetAddress,
      city,
      state,
      zipCode,
      cdlNumber,
      cdlState,
      cdlClass,
      licenseExpiration,
      endorsements: endorsements ? (typeof endorsements === 'string' ? JSON.parse(endorsements) : endorsements) : null,
      hasTWIC: hasTWIC === 'Yes' || hasTWIC === true,
      twicExpiration,
      yearsExperience,
      hasAccidents: hasAccidents === 'Yes' || hasAccidents === true,
      accidentDetails,
      hasViolations: hasViolations === 'Yes' || hasViolations === true,
      violationDetails,
      hasDUI: hasDUI === 'Yes' || hasDUI === true,
      duiDetails,
      employer1Name,
      employer1Phone,
      employer1Position,
      employer1StartDate,
      employer1EndDate,
      employer1ReasonLeaving,
      employer2Name,
      employer2Phone,
      employer2Position,
      employer2StartDate,
      employer2EndDate,
      employer2ReasonLeaving,
      hasOwnTruck: hasOwnTruck === 'Yes' || hasOwnTruck === true,
      truckYear,
      truckMake,
      truckModel,
      truckVIN,
      hasTrailer: hasTrailer === 'Yes' || hasTrailer === true,
      trailerType,
      trailerLength,
      ref1Name,
      ref1Phone,
      ref1Relationship,
      ref2Name,
      ref2Phone,
      ref2Relationship,
      certifyTrue: certifyTrue === true || certifyTrue === 'true',
      authorizeContact: authorizeContact === true || authorizeContact === 'true',
      electronicSignature
    };

    // Send to GoHighLevel webhook
    console.log('=== APPLICATION RECEIVED ===');
    console.log('Application ID:', applicationId);
    console.log('Email:', email);
    console.log('Name:', firstName, lastName);

    try {
      console.log('Sending to GoHighLevel...');
      const ghlResult = await goHighLevelService.sendToWebhook(applicationData);
      console.log('GoHighLevel sync result:', ghlResult);
    } catch (ghlError) {
      console.error('GoHighLevel sync error:', ghlError.message);
      // Don't fail the request, just log the error
    }

    // If database is available, save to DB
    let user = null;
    let dbApplication = null;

    if (dbAvailable && User && Application) {
      try {
        // Check if user exists
        user = await User.findOne({ where: { email: email.toLowerCase() } });

        if (!user) {
          if (!password) {
            return res.status(400).json({
              success: false,
              message: 'Password is required for new users'
            });
          }

          user = await User.create({
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            phone,
            role: 'driver'
          });
        }

        // Create application in DB
        dbApplication = await Application.create({
          ...applicationData,
          userId: user.id
        });
      } catch (dbError) {
        console.error('Database error:', dbError.message);
        // Continue without DB
      }
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId,
        status: 'pending',
        submittedAt,
        user: user ? {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        } : { email, firstName, lastName },
        isNewUser: !user || true
      }
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
});

// GET /api/applications/status/:id - Get application status (no auth required for demo)
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (dbAvailable && Application) {
      const application = await Application.findOne({
        where: { applicationId: id }
      });

      if (application) {
        return res.json({
          success: true,
          data: {
            applicationId: application.applicationId,
            status: application.status,
            submittedAt: application.submittedAt
          }
        });
      }
    }

    // Return generic response if not found or no DB
    res.json({
      success: true,
      data: {
        applicationId: id,
        status: 'pending',
        message: 'Application received - check GoHighLevel for details'
      }
    });
  } catch (error) {
    console.error('Get application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get application status'
    });
  }
});

module.exports = router;
