'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const currentYear = new Date().getFullYear();
    const season = `${currentYear}-${currentYear + 1}`;

    await queryInterface.bulkInsert('leaderboards', [
      {
        division_id: 1, // Pro division
        standings: [
          {
            teamName: 'Thunder Hawks',
            played: 10,
            won: 8,
            drawn: 1,
            lost: 1,
            goalsFor: 24,
            goalsAgainst: 8,
            goalDifference: 16,
            points: 25,
          },
          {
            teamName: 'Lightning Bolts',
            played: 10,
            won: 7,
            drawn: 2,
            lost: 1,
            goalsFor: 20,
            goalsAgainst: 9,
            goalDifference: 11,
            points: 23,
          },
          {
            teamName: 'Storm Eagles',
            played: 10,
            won: 6,
            drawn: 2,
            lost: 2,
            goalsFor: 18,
            goalsAgainst: 10,
            goalDifference: 8,
            points: 20,
          },
          {
            teamName: 'Fire Lions',
            played: 10,
            won: 5,
            drawn: 3,
            lost: 2,
            goalsFor: 16,
            goalsAgainst: 12,
            goalDifference: 4,
            points: 18,
          },
        ],
        last_updated: new Date(),
        season: season,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        division_id: 2, // Soccer division
        standings: [
          {
            teamName: 'United FC',
            played: 8,
            won: 6,
            drawn: 1,
            lost: 1,
            goalsFor: 18,
            goalsAgainst: 7,
            goalDifference: 11,
            points: 19,
          },
          {
            teamName: 'City Rangers',
            played: 8,
            won: 5,
            drawn: 2,
            lost: 1,
            goalsFor: 15,
            goalsAgainst: 8,
            goalDifference: 7,
            points: 17,
          },
          {
            teamName: 'Athletic Club',
            played: 8,
            won: 4,
            drawn: 2,
            lost: 2,
            goalsFor: 12,
            goalsAgainst: 9,
            goalDifference: 3,
            points: 14,
          },
        ],
        last_updated: new Date(),
        season: season,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        division_id: 3, // Rookie division
        standings: [
          {
            teamName: 'Beginners United',
            played: 6,
            won: 4,
            drawn: 1,
            lost: 1,
            goalsFor: 12,
            goalsAgainst: 6,
            goalDifference: 6,
            points: 13,
          },
          {
            teamName: 'New Comers FC',
            played: 6,
            won: 3,
            drawn: 2,
            lost: 1,
            goalsFor: 9,
            goalsAgainst: 7,
            goalDifference: 2,
            points: 11,
          },
          {
            teamName: 'Rising Stars',
            played: 6,
            won: 2,
            drawn: 2,
            lost: 2,
            goalsFor: 8,
            goalsAgainst: 9,
            goalDifference: -1,
            points: 8,
          },
        ],
        last_updated: new Date(),
        season: season,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('leaderboards', {
      division_id: [1, 2, 3],
    });
  },
};