'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await queryInterface.bulkInsert('users', [{
      id: uuidv4(),
      email: 'admin@jrmltrucking.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'JRML',
      phone: '555-000-0000',
      role: 'admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@jrmltrucking.com' });
  }
};
