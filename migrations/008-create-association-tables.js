'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create user_tournaments table (many-to-many between users and tournaments)
    await queryInterface.createTable('user_tournaments', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tournament_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'tournaments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    // Create user_cups table (many-to-many between users and cups)
    await queryInterface.createTable('user_cups', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cup_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'cups',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    // Create tournament_cups table (many-to-many between tournaments and cups)
    await queryInterface.createTable('tournament_cups', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      tournament_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'tournaments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cup_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'cups',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    // Add unique constraints to prevent duplicate associations
    await queryInterface.addIndex('user_tournaments', ['user_id', 'tournament_id'], {
      unique: true,
      name: 'user_tournaments_unique',
    });

    await queryInterface.addIndex('user_cups', ['user_id', 'cup_id'], {
      unique: true,
      name: 'user_cups_unique',
    });

    await queryInterface.addIndex('tournament_cups', ['tournament_id', 'cup_id'], {
      unique: true,
      name: 'tournament_cups_unique',
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('user_tournaments', ['user_id']);
    await queryInterface.addIndex('user_tournaments', ['tournament_id']);

    await queryInterface.addIndex('user_cups', ['user_id']);
    await queryInterface.addIndex('user_cups', ['cup_id']);

    await queryInterface.addIndex('tournament_cups', ['tournament_id']);
    await queryInterface.addIndex('tournament_cups', ['cup_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_tournaments');
    await queryInterface.dropTable('user_cups');
    await queryInterface.dropTable('tournament_cups');
  },
};