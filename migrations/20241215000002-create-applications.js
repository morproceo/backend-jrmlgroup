'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('applications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      application_id: {
        type: Sequelize.STRING(20),
        unique: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'review', 'background', 'approved', 'rejected'),
        defaultValue: 'pending'
      },

      // Position
      position: {
        type: Sequelize.ENUM('OO', 'LO'),
        allowNull: false
      },

      // Personal Information
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      ssn: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },

      // Address
      street_address: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      state: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      zip_code: {
        type: Sequelize.STRING(20),
        allowNull: true
      },

      // License & CDL
      cdl_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      cdl_state: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      cdl_class: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      license_expiration: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      endorsements: {
        type: Sequelize.JSON,
        allowNull: true
      },
      has_twic: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      twic_expiration: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },

      // Driving Record
      years_experience: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      has_accidents: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      accident_details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      has_violations: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      violation_details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      has_dui: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      dui_details: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      // Employment History - Employer 1
      employer1_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      employer1_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      employer1_position: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      employer1_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      employer1_end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      employer1_reason_leaving: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      // Employment History - Employer 2
      employer2_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      employer2_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      employer2_position: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      employer2_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      employer2_end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      employer2_reason_leaving: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      // Equipment (Owner Operators)
      has_own_truck: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      truck_year: {
        type: Sequelize.STRING(4),
        allowNull: true
      },
      truck_make: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      truck_model: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      truck_vin: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      has_trailer: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      trailer_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      trailer_length: {
        type: Sequelize.STRING(20),
        allowNull: true
      },

      // References
      ref1_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ref1_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      ref1_relationship: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      ref2_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ref2_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      ref2_relationship: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      // Legal & Certifications
      certify_true: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      authorize_contact: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      electronic_signature: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      // Documents
      documents: {
        type: Sequelize.JSON,
        allowNull: true
      },

      // GoHighLevel Integration
      ghl_contact_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      ghl_synced_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      // Admin Notes
      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('applications', ['application_id']);
    await queryInterface.addIndex('applications', ['user_id']);
    await queryInterface.addIndex('applications', ['status']);
    await queryInterface.addIndex('applications', ['email']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('applications');
  }
};
