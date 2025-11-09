'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('brackets', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
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
      structure: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      current_round: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      total_rounds: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('not_started', 'in_progress', 'completed'),
        allowNull: false,
        defaultValue: 'not_started',
      },
      winner: {
        type: Sequelize.STRING(100),
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
    await queryInterface.addIndex('brackets', ['status']);
    await queryInterface.addIndex('brackets', ['current_round']);
    await queryInterface.addIndex('brackets', ['total_rounds']);

    // Add unique constraints - one bracket per tournament/cup
    await queryInterface.addIndex('brackets', ['tournament_id'], {
      unique: true,
      where: {
        tournament_id: { [Sequelize.Op.ne]: null },
      },
    });

    await queryInterface.addIndex('brackets', ['cup_id'], {
      unique: true,
      where: {
        cup_id: { [Sequelize.Op.ne]: null },
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('brackets');
  },
};