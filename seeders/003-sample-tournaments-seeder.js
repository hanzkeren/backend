'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const currentDate = new Date();
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const nextMonthEnd = new Date(nextMonth);
    nextMonthEnd.setDate(nextMonthEnd.getDate() + 30);

    await queryInterface.bulkInsert('tournaments', [
      {
        name: 'Summer Championship 2024',
        description: 'Annual summer championship tournament featuring the best teams in the region',
        start_date: nextMonth,
        end_date: nextMonthEnd,
        division_id: 1, // Pro division
        created_by: 1, // Superadmin
        status: 'planning',
        max_participants: 16,
        registration_deadline: new Date(nextMonth.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before start
        rules: 'Standard soccer rules apply. Each match consists of two 45-minute halves.',
        prize_info: 'First place: $10,000, Second place: $5,000, Third place: $2,500',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Spring Soccer League',
        description: 'Competitive league for soccer enthusiasts of all skill levels',
        start_date: nextMonth,
        end_date: nextMonthEnd,
        division_id: 2, // Soccer division
        created_by: 2, // Admin
        status: 'planning',
        max_participants: 12,
        registration_deadline: new Date(nextMonth.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before start
        rules: '7-a-side soccer format. Each match lasts 60 minutes total.',
        prize_info: 'Trophies for top 3 teams and medals for all participants',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Rookie Development Tournament',
        description: 'Perfect tournament for beginners to gain experience and have fun',
        start_date: nextMonth,
        end_date: nextMonthEnd,
        division_id: 3, // Rookie division
        created_by: 2, // Admin
        status: 'planning',
        max_participants: 8,
        registration_deadline: new Date(nextMonth.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days before start
        rules: 'Modified rules for beginners. Focus on participation and learning.',
        prize_info: 'Participation certificates for all teams',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Youth Championship U-18',
        description: 'Youth tournament for players under 18 years old',
        start_date: nextMonth,
        end_date: nextMonthEnd,
        division_id: 4, // Youth division
        created_by: 2, // Admin
        status: 'planning',
        max_participants: 10,
        registration_deadline: new Date(nextMonth.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days before start
        rules: 'Youth soccer rules with additional safety measures',
        prize_info: 'Medals and certificates for all participants',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tournaments', {
      name: [
        'Summer Championship 2024',
        'Spring Soccer League',
        'Rookie Development Tournament',
        'Youth Championship U-18',
      ],
    });
  },
};