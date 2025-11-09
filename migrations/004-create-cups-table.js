'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cups', {
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
      cup_type: {
        type: Sequelize.ENUM('knockout', 'group', 'league'),
        allowNull: false,
        defaultValue: 'knockout',
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
    await queryInterface.addIndex('cups', ['division_id']);
    await queryInterface.addIndex('cups', ['created_by']);
    await queryInterface.addIndex('cups', ['status']);
    await queryInterface.addIndex('cups', ['cup_type']);
    await queryInterface.addIndex('cups', ['start_date']);
    await queryInterface.addIndex('cups', ['end_date']);
    await queryInterface.addIndex('cups', ['registration_deadline']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cups');
  },
};