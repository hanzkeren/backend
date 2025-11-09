import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

export interface MatchAttributes {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  matchDate: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  tournamentId?: number;
  cupId?: number;
  divisionId: number;
  venue?: string;
  notes?: string;
  referee?: string;
  matchNumber?: number;
  round?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MatchCreationAttributes extends Optional<MatchAttributes, 'id' | 'createdAt' | 'updatedAt' | 'homeScore' | 'awayScore' | 'tournamentId' | 'cupId' | 'venue' | 'notes' | 'referee' | 'matchNumber' | 'round'> {}

class Match extends Model<MatchAttributes, MatchCreationAttributes> implements MatchAttributes {
  public id!: number;
  public homeTeam!: string;
  public awayTeam!: string;
  public homeScore?: number;
  public awayScore?: number;
  public matchDate!: Date;
  public status!: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  public tournamentId?: number;
  public cupId?: number;
  public divisionId!: number;
  public venue?: string;
  public notes?: string;
  public referee?: string;
  public matchNumber?: number;
  public round?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public get isScheduled(): boolean {
    return this.status === 'scheduled';
  }

  public get isInProgress(): boolean {
    return this.status === 'in_progress';
  }

  public get isCompleted(): boolean {
    return this.status === 'completed';
  }

  public get isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  public get isPostponed(): boolean {
    return this.status === 'postponed';
  }

  public get hasResult(): boolean {
    return this.homeScore !== undefined && this.awayScore !== undefined;
  }

  public get winner(): 'home' | 'away' | 'draw' | null {
    if (!this.hasResult || this.status !== 'completed') return null;

    if (this.homeScore! > this.awayScore!) return 'home';
    if (this.awayScore! > this.homeScore!) return 'away';
    return 'draw';
  }

  public get loser(): 'home' | 'away' | null {
    const winnerResult = this.winner;
    if (winnerResult === 'home') return 'away';
    if (winnerResult === 'away') return 'home';
    return null;
  }

  public get isDraw(): boolean {
    return this.winner === 'draw';
  }

  public get isTournamentMatch(): boolean {
    return this.tournamentId !== undefined && this.tournamentId !== null;
  }

  public get isCupMatch(): boolean {
    return this.cupId !== undefined && this.cupId !== null;
  }

  // Instance methods
  public async startMatch(): Promise<void> {
    if (this.status !== 'scheduled') {
      throw new Error('Only scheduled matches can be started');
    }
    this.status = 'in_progress';
    await this.save();
  }

  public async completeMatch(homeScore: number, awayScore: number): Promise<void> {
    if (this.status !== 'in_progress') {
      throw new Error('Only in-progress matches can be completed');
    }
    if (homeScore < 0 || awayScore < 0) {
      throw new Error('Scores cannot be negative');
    }
    this.homeScore = homeScore;
    this.awayScore = awayScore;
    this.status = 'completed';
    await this.save();
  }

  public async cancel(reason?: string): Promise<void> {
    this.status = 'cancelled';
    if (reason) {
      this.notes = reason;
    }
    await this.save();
  }

  public async postpone(newDate: Date, reason?: string): Promise<void> {
    if (newDate <= new Date()) {
      throw new Error('New match date must be in the future');
    }
    this.status = 'postponed';
    this.matchDate = newDate;
    if (reason) {
      this.notes = reason;
    }
    await this.save();
  }

  public async reschedule(newDate: Date): Promise<void> {
    if (newDate <= new Date()) {
      throw new Error('New match date must be in the future');
    }
    this.matchDate = newDate;
    if (this.status === 'postponed') {
      this.status = 'scheduled';
    }
    await this.save();
  }

  public async updateScore(homeScore: number, awayScore: number): Promise<void> {
    if (this.status !== 'completed') {
      throw new Error('Only completed matches can have scores updated');
    }
    if (homeScore < 0 || awayScore < 0) {
      throw new Error('Scores cannot be negative');
    }
    this.homeScore = homeScore;
    this.awayScore = awayScore;
    await this.save();
  }
}

Match.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    homeTeam: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
      set(value: string) {
        this.setDataValue('homeTeam', value.trim());
      },
    },
    awayTeam: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
      set(value: string) {
        this.setDataValue('awayTeam', value.trim());
      },
    },
    homeScore: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      validate: {
        min: 0,
      },
    },
    awayScore: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      validate: {
        min: 0,
      },
    },
    matchDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
    tournamentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'tournaments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    cupId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'cups',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    divisionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'divisions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    venue: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    referee: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    matchNumber: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    round: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: 'matches',
    sequelize,
    validate: {
      eitherTournamentOrCup() {
        if (!this.tournamentId && !this.cupId) {
          throw new Error('Match must belong to either a tournament or a cup');
        }
        if (this.tournamentId && this.cupId) {
          throw new Error('Match cannot belong to both tournament and cup');
        }
      },
      differentTeams() {
        if (this.homeTeam.toLowerCase() === this.awayTeam.toLowerCase()) {
          throw new Error('Home and away teams must be different');
        }
      },
    },
    indexes: [
      {
        fields: ['tournament_id'],
      },
      {
        fields: ['cup_id'],
      },
      {
        fields: ['division_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['match_date'],
      },
      {
        fields: ['home_team'],
      },
      {
        fields: ['away_team'],
      },
      {
        fields: ['match_number'],
      },
      {
        fields: ['round'],
      },
      {
        unique: true,
        fields: ['tournament_id', 'match_number'],
        where: {
          tournament_id: { [sequelize.Sequelize.Op.ne]: null },
        },
      },
      {
        unique: true,
        fields: ['cup_id', 'match_number'],
        where: {
          cup_id: { [sequelize.Sequelize.Op.ne]: null },
        },
      },
    ],
  }
);

export default Match;