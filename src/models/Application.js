'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    applicationId: {
      type: DataTypes.STRING(20),
      unique: true,
      field: 'application_id'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'review', 'background', 'approved', 'rejected'),
      defaultValue: 'pending'
    },

    // Position
    position: {
      type: DataTypes.ENUM('OO', 'LO'),
      allowNull: false,
      comment: 'OO = Owner Operator, LO = Lease Operator'
    },

    // Personal Information
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'date_of_birth'
    },
    ssn: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Social Security Number - encrypted'
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'start_date',
      comment: 'Earliest available start date'
    },

    // Address
    streetAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'street_address'
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'zip_code'
    },

    // License & CDL
    cdlNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'cdl_number'
    },
    cdlState: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'cdl_state'
    },
    cdlClass: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'cdl_class'
    },
    licenseExpiration: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'license_expiration'
    },
    endorsements: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of endorsements like Hazmat, Tanker, Doubles'
    },
    hasTWIC: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'has_twic'
    },
    twicExpiration: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'twic_expiration'
    },

    // Driving Record
    yearsExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'years_experience'
    },
    hasAccidents: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'has_accidents'
    },
    accidentDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'accident_details'
    },
    hasViolations: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'has_violations'
    },
    violationDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'violation_details'
    },
    hasDUI: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'has_dui'
    },
    duiDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'dui_details'
    },

    // Employment History - Employer 1
    employer1Name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'employer1_name'
    },
    employer1Phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'employer1_phone'
    },
    employer1Position: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'employer1_position'
    },
    employer1StartDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'employer1_start_date'
    },
    employer1EndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'employer1_end_date'
    },
    employer1ReasonLeaving: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'employer1_reason_leaving'
    },

    // Employment History - Employer 2
    employer2Name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'employer2_name'
    },
    employer2Phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'employer2_phone'
    },
    employer2Position: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'employer2_position'
    },
    employer2StartDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'employer2_start_date'
    },
    employer2EndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'employer2_end_date'
    },
    employer2ReasonLeaving: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'employer2_reason_leaving'
    },

    // Equipment (Owner Operators)
    hasOwnTruck: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'has_own_truck'
    },
    truckYear: {
      type: DataTypes.STRING(4),
      allowNull: true,
      field: 'truck_year'
    },
    truckMake: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'truck_make'
    },
    truckModel: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'truck_model'
    },
    truckVIN: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'truck_vin'
    },
    hasTrailer: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'has_trailer'
    },
    trailerType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'trailer_type'
    },
    trailerLength: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'trailer_length'
    },

    // References
    ref1Name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'ref1_name'
    },
    ref1Phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'ref1_phone'
    },
    ref1Relationship: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'ref1_relationship'
    },
    ref2Name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'ref2_name'
    },
    ref2Phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'ref2_phone'
    },
    ref2Relationship: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'ref2_relationship'
    },

    // Legal & Certifications
    certifyTrue: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'certify_true'
    },
    authorizeContact: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'authorize_contact'
    },
    electronicSignature: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'electronic_signature'
    },

    // Documents (stored as JSON array of file paths/URLs)
    documents: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of uploaded document references'
    },

    // GoHighLevel Integration
    ghlContactId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'ghl_contact_id'
    },
    ghlSyncedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'ghl_synced_at'
    },

    // Admin Notes
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'admin_notes'
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'reviewed_by'
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reviewed_at'
    },

    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'submitted_at'
    }
  }, {
    tableName: 'applications',
    underscored: true,
    hooks: {
      beforeCreate: (application) => {
        // Generate readable application ID like JRML-2024-0001
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 9000) + 1000;
        application.applicationId = `JRML-${year}-${random}`;
        application.submittedAt = new Date();
      }
    }
  });

  Application.associate = function(models) {
    Application.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Application;
};
