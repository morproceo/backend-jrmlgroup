require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS for production domains
const allowedOrigins = [
  'https://www.jrmlgroup.com',
  'https://jrmlgroup.com',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now during development
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// Signatures endpoint - receives signed documents from driver portal
app.post('/api/signatures', async (req, res) => {
  console.log('=== SIGNATURE SUBMISSION RECEIVED ===');

  try {
    const { documentId, documentName, driverId, driverEmail, signatureData, signatureType, signedAt } = req.body;

    console.log('Document:', documentName);
    console.log('Driver:', driverEmail);
    console.log('Signature Type:', signatureType);
    console.log('Signed At:', signedAt);

    // Validate required fields
    if (!documentId || !driverEmail || !signatureData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: documentId, driverEmail, and signatureData are required'
      });
    }

    // Send to GoHighLevel webhook for tracking
    const ghlService = require('./services/goHighLevel');

    try {
      await ghlService.sendToWebhook({
        firstName: 'Driver',
        lastName: 'Signature',
        email: driverEmail,
        applicationId: `SIG-${documentId}-${Date.now()}`,
        status: 'Document Signed',
        position: 'OO',
        submittedAt: signedAt,
        // Custom fields for signature tracking
        electronicSignature: signatureType === 'typed' ? signatureData : 'Canvas Signature',
        employer1Name: documentName, // Using this field to store document name
        employer1ReasonLeaving: `Signed via ${signatureType} signature` // Store signature method
      });
      console.log('Signature sent to GoHighLevel');
    } catch (ghlError) {
      console.error('GoHighLevel webhook error:', ghlError.message);
      // Don't fail the request if GHL fails
    }

    console.log('=== SIGNATURE PROCESSED SUCCESSFULLY ===');

    res.json({
      success: true,
      message: 'Document signed successfully',
      data: {
        documentId,
        documentName,
        signedAt,
        confirmationNumber: `JRML-SIG-${Date.now()}`
      }
    });

  } catch (error) {
    console.error('Signature processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process signature'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Database connection and server start
async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected successfully');

    // Sync models (in development)
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('Database models synced');
    }
  } catch (error) {
    console.warn('Database connection failed, running in webhook-only mode:', error.message);
    console.warn('Applications will be sent to GoHighLevel but not stored locally.');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();

module.exports = app;
