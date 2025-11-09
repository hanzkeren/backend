'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tournaments', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      division_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'divisions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      status: {
        type: Sequelize.ENUM('planning', 'active', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'planning',
      },
      max_participants: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      registration_deadline: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      rules: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      prize_info: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('tournaments', ['division_id']);
    await queryInterface.addIndex('tournaments', ['created_by']);
    await queryInterface.addIndex('tournaments', ['status']);
    await queryInterface.addIndex('tournaments', ['start_date']);
    await queryInterface.addIndex('tournaments', ['end_date']);
    await queryInterface.addIndex('tournaments', ['registration_deadline']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tournaments');
  },
};