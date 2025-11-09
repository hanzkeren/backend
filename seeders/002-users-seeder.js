'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash passwords for security
    const superadminPassword = await bcrypt.hash('SuperAdmin123!', 12);
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const userPassword = await bcrypt.hash('User123!', 12);

    await queryInterface.bulkInsert('users', [
      {
        email: 'superadmin@tournament.com',
        password: superadminPassword,
        first_name: 'Super',
        last_name: 'Admin',
        role: 'superadmin',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'admin@tournament.com',
        password: adminPassword,
        first_name: 'Tournament',
        last_name: 'Administrator',
        role: 'admin',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'john.doe@example.com',
        password: userPassword,
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'jane.smith@example.com',
        password: userPassword,
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'user',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'mike.johnson@example.com',
        password: userPassword,
        first_name: 'Mike',
        last_name: 'Johnson',
        role: 'user',
        is_active: true,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: [
        'superadmin@tournament.com',
        'admin@tournament.com',
        'john.doe@example.com',
        'jane.smith@example.com',
        'mike.johnson@example.com',
      ],
    });
  },
};