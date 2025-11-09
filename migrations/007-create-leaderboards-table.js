'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('leaderboards', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      division_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'divisions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      standings: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      last_updated: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      season: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      tournament_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'tournaments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cup_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
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

    // Add indexes
    await queryInterface.addIndex('leaderboards', ['division_id']);
    await queryInterface.addIndex('leaderboards', ['tournament_id']);
    await queryInterface.addIndex('leaderboards', ['cup_id']);
    await queryInterface.addIndex('leaderboards', ['season']);
    await queryInterface.addIndex('leaderboards', ['last_updated']);

    // Add unique constraints
    await queryInterface.addIndex('leaderboards', ['division_id', 'tournament_id'], {
      unique: true,
      where: {
        tournament_id: { [Sequelize.Op.ne]: null },
        cup_id: null,
      },
    });

    await queryInterface.addIndex('leaderboards', ['division_id', 'cup_id'], {
      unique: true,
      where: {
        cup_id: { [Sequelize.Op.ne]: null },
        tournament_id: null,
      },
    });

    await queryInterface.addIndex('leaderboards', ['division_id', 'season'], {
      unique: true,
      where: {
        tournament_id: null,
        cup_id: null,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('leaderboards');
  },
};