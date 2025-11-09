'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('divisions', [
      {
        name: 'Pro',
        description: 'Professional division for elite teams and players',
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Soccer',
        description: 'Competitive soccer division for experienced players',
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Rookie',
        description: 'Entry-level division for beginners and new players',
        is_active: true,
        sort_order: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Youth',
        description: 'Youth division for players under 18',
        is_active: true,
        sort_order: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Veterans',
        description: 'Division for players over 35 years old',
        is_active: true,
        sort_order: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Women',
        description: "Women's division for female players",
        is_active: true,
        sort_order: 6,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('divisions', {
      name: ['Pro', 'Soccer', 'Rookie', 'Youth', 'Veterans', 'Women'],
    });
  },
};