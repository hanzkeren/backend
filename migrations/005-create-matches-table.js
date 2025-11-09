'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('matches', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      home_team: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      away_team: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      home_score: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      away_score: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      match_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'),
        allowNull: false,
        defaultValue: 'scheduled',
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
      venue: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      referee: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      match_number: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      round: {
        type: Sequelize.STRING(50),
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
    await queryInterface.addIndex('matches', ['tournament_id']);
    await queryInterface.addIndex('matches', ['cup_id']);
    await queryInterface.addIndex('matches', ['division_id']);
    await queryInterface.addIndex('matches', ['status']);
    await queryInterface.addIndex('matches', ['match_date']);
    await queryInterface.addIndex('matches', ['home_team']);
    await queryInterface.addIndex('matches', ['away_team']);
    await queryInterface.addIndex('matches', ['match_number']);
    await queryInterface.addIndex('matches', ['round']);

    // Add unique constraints for match numbers within tournaments/cups
    await queryInterface.addIndex('matches', ['tournament_id', 'match_number'], {
      unique: true,
      where: {
        tournament_id: { [Sequelize.Op.ne]: null },
      },
    });

    await queryInterface.addIndex('matches', ['cup_id', 'match_number'], {
      unique: true,
      where: {
        cup_id: { [Sequelize.Op.ne]: null },
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('matches');
  },
};