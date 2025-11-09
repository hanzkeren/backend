'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const currentDate = new Date();
    const twoMonthsFromNow = new Date(currentDate);
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

    const twoMonthsEnd = new Date(twoMonthsFromNow);
    twoMonthsEnd.setDate(twoMonthsEnd.getDate() + 14);

    await queryInterface.bulkInsert('cups', [
      {
        name: 'Knockout Cup 2024',
        description: 'Annual knockout tournament with single elimination format',
        start_date: twoMonthsFromNow,
        end_date: twoMonthsEnd,
        division_id: 1, // Pro division
        created_by: 1, // Superadmin
        status: 'planning',
        cup_type: 'knockout',
        max_participants: 32,
        registration_deadline: new Date(twoMonthsFromNow.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks before start
        rules: 'Single elimination knockout format. Winner advances, loser is eliminated.',
        prize_info: 'Grand prize: $15,000 for the champion',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Group Stage Cup',
        description: 'Tournament featuring group stage followed by knockout rounds',
        start_date: twoMonthsFromNow,
        end_date: twoMonthsEnd,
        division_id: 2, // Soccer division
        created_by: 2, // Admin
        status: 'planning',
        cup_type: 'group',
        max_participants: 16,
        registration_deadline: new Date(twoMonthsFromNow.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days before start
        rules: '4 teams per group. Top 2 from each group advance to knockout stage.',
        prize_info: 'Cash prizes for top 4 teams',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Veterans League Cup',
        description: 'Special cup tournament for veteran players (35+)',
        start_date: twoMonthsFromNow,
        end_date: new Date(twoMonthsEnd.getTime() + 7 * 24 * 60 * 60 * 1000), // Extra week
        division_id: 5, // Veterans division
        created_by: 2, // Admin
        status: 'planning',
        cup_type: 'league',
        max_participants: 8,
        registration_deadline: new Date(twoMonthsFromNow.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before start
        rules: 'Round-robin league format. All teams play against each other.',
        prize_info: 'Trophies and gift certificates for winners',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Women's Championship Cup",
        description: "Premier cup tournament for women's teams",
        start_date: twoMonthsFromNow,
        end_date: twoMonthsEnd,
        division_id: 6, // Women division
        created_by: 2, // Admin
        status: 'planning',
        cup_type: 'knockout',
        max_participants: 16,
        registration_deadline: new Date(twoMonthsFromNow.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before start
        rules: 'Single elimination knockout format with emphasis on sportsmanship.',
        prize_info: 'Championship trophy and prize money',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('cups', {
      name: [
        'Knockout Cup 2024',
        'Group Stage Cup',
        'Veterans League Cup',
        "Women's Championship Cup",
      ],
    });
  },
};