import sequelize from '@/config/database';
import User from './User';
import Division from './Division';
import Tournament from './Tournament';
import Cup from './Cup';
import Match from './Match';
import Bracket from './Bracket';
import Leaderboard from './Leaderboard';

// Define many-to-many association tables
const UserTournament = sequelize.define('UserTournament', {}, {
  tableName: 'user_tournaments',
  timestamps: true,
  underscored: true,
});

const UserCup = sequelize.define('UserCup', {}, {
  tableName: 'user_cups',
  timestamps: true,
  underscored: true,
});

const TournamentCup = sequelize.define('TournamentCup', {}, {
  tableName: 'tournament_cups',
  timestamps: true,
  underscored: true,
});

// User relationships
User.belongsToMany(Tournament, {
  through: UserTournament,
  foreignKey: 'userId',
  otherKey: 'tournamentId',
  as: 'participatingTournaments',
});

User.belongsToMany(Cup, {
  through: UserCup,
  foreignKey: 'userId',
  otherKey: 'cupId',
  as: 'participatingCups',
});

// Tournament relationships
Tournament.belongsToMany(User, {
  through: UserTournament,
  foreignKey: 'tournamentId',
  otherKey: 'userId',
  as: 'participants',
});

Tournament.belongsTo(Division, {
  foreignKey: 'divisionId',
  as: 'division',
});

Tournament.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

Tournament.hasMany(Match, {
  foreignKey: 'tournamentId',
  as: 'matches',
});

Tournament.hasOne(Bracket, {
  foreignKey: 'tournamentId',
  as: 'bracket',
});

Tournament.hasOne(Leaderboard, {
  foreignKey: 'tournamentId',
  as: 'leaderboard',
});

// Cup relationships
Cup.belongsToMany(User, {
  through: UserCup,
  foreignKey: 'cupId',
  otherKey: 'userId',
  as: 'participants',
});

Cup.belongsTo(Division, {
  foreignKey: 'divisionId',
  as: 'division',
});

Cup.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

Cup.hasMany(Match, {
  foreignKey: 'cupId',
  as: 'matches',
});

Cup.hasOne(Bracket, {
  foreignKey: 'cupId',
  as: 'bracket',
});

Cup.hasOne(Leaderboard, {
  foreignKey: 'cupId',
  as: 'leaderboard',
});

// Tournament-Cup many-to-many relationship
Tournament.belongsToMany(Cup, {
  through: TournamentCup,
  foreignKey: 'tournamentId',
  otherKey: 'cupId',
  as: 'linkedCups',
});

Cup.belongsToMany(Tournament, {
  through: TournamentCup,
  foreignKey: 'cupId',
  otherKey: 'tournamentId',
  as: 'linkedTournaments',
});

// Division relationships
Division.hasMany(Tournament, {
  foreignKey: 'divisionId',
  as: 'tournaments',
});

Division.hasMany(Cup, {
  foreignKey: 'divisionId',
  as: 'cups',
});

Division.hasMany(Match, {
  foreignKey: 'divisionId',
  as: 'matches',
});

Division.hasMany(Leaderboard, {
  foreignKey: 'divisionId',
  as: 'leaderboards',
});

// Match relationships
Match.belongsTo(Tournament, {
  foreignKey: 'tournamentId',
  as: 'tournament',
});

Match.belongsTo(Cup, {
  foreignKey: 'cupId',
  as: 'cup',
});

Match.belongsTo(Division, {
  foreignKey: 'divisionId',
  as: 'division',
});

// Bracket relationships
Bracket.belongsTo(Tournament, {
  foreignKey: 'tournamentId',
  as: 'tournament',
});

Bracket.belongsTo(Cup, {
  foreignKey: 'cupId',
  as: 'cup',
});

// Leaderboard relationships
Leaderboard.belongsTo(Division, {
  foreignKey: 'divisionId',
  as: 'division',
});

Leaderboard.belongsTo(Tournament, {
  foreignKey: 'tournamentId',
  as: 'tournament',
});

Leaderboard.belongsTo(Cup, {
  foreignKey: 'cupId',
  as: 'cup',
});

// Export all models and associations
export {
  sequelize,
  User,
  Division,
  Tournament,
  Cup,
  Match,
  Bracket,
  Leaderboard,
  UserTournament,
  UserCup,
  TournamentCup,
};

// Type exports for TypeScript
export type {
  UserAttributes,
  UserCreationAttributes,
} from './User';

export type {
  DivisionAttributes,
  DivisionCreationAttributes,
} from './Division';

export type {
  TournamentAttributes,
  TournamentCreationAttributes,
} from './Tournament';

export type {
  CupAttributes,
  CupCreationAttributes,
} from './Cup';

export type {
  MatchAttributes,
  MatchCreationAttributes,
} from './Match';

export type {
  BracketAttributes,
  BracketCreationAttributes,
} from './Bracket';

export type {
  LeaderboardAttributes,
  LeaderboardCreationAttributes,
  LeaderboardEntry,
} from './Leaderboard';