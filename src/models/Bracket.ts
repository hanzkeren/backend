import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

export interface BracketAttributes {
  id: number;
  tournamentId?: number;
  cupId?: number;
  structure: object; // JSON structure for the bracket tree
  currentRound: number;
  totalRounds: number;
  status: 'not_started' | 'in_progress' | 'completed';
  winner?: string; // Team name or ID
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BracketCreationAttributes extends Optional<BracketAttributes, 'id' | 'createdAt' | 'updatedAt' | 'tournamentId' | 'cupId' | 'currentRound' | 'status' | 'winner'> {}

class Bracket extends Model<BracketAttributes, BracketCreationAttributes> implements BracketAttributes {
  public id!: number;
  public tournamentId?: number;
  public cupId?: number;
  public structure!: object;
  public currentRound!: number;
  public totalRounds!: number;
  public status!: 'not_started' | 'in_progress' | 'completed';
  public winner?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public get isTournamentBracket(): boolean {
    return this.tournamentId !== undefined && this.tournamentId !== null;
  }

  public get isCupBracket(): boolean {
    return this.cupId !== undefined && this.cupId !== null;
  }

  public get isNotStarted(): boolean {
    return this.status === 'not_started';
  }

  public get isInProgress(): boolean {
    return this.status === 'in_progress';
  }

  public get isCompleted(): boolean {
    return this.status === 'completed';
  }

  public get isFinalRound(): boolean {
    return this.currentRound >= this.totalRounds;
  }

  // Instance methods
  public async startBracket(): Promise<void> {
    if (this.status !== 'not_started') {
      throw new Error('Only not started brackets can be started');
    }
    this.status = 'in_progress';
    this.currentRound = 1;
    await this.save();
  }

  public async advanceToNextRound(): Promise<void> {
    if (this.status !== 'in_progress') {
      throw new Error('Only in-progress brackets can advance rounds');
    }
    if (this.currentRound >= this.totalRounds) {
      throw new Error('Cannot advance beyond total rounds');
    }
    this.currentRound += 1;
    if (this.currentRound >= this.totalRounds) {
      this.status = 'completed';
    }
    await this.save();
  }

  public async completeBracket(winner: string): Promise<void> {
    if (this.status !== 'in_progress') {
      throw new Error('Only in-progress brackets can be completed');
    }
    this.status = 'completed';
    this.winner = winner;
    this.currentRound = this.totalRounds;
    await this.save();
  }

  public updateStructure(newStructure: object): void {
    this.structure = newStructure;
  }

  public getStructure(): object {
    return this.structure;
  }
}

Bracket.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
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
      unique: 'bracket_event_unique',
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
      unique: 'bracket_event_unique',
    },
    structure: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    currentRound: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    totalRounds: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    status: {
      type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
      allowNull: false,
      defaultValue: 'not_started',
    },
    winner: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: 'brackets',
    sequelize,
    validate: {
      eitherTournamentOrCup() {
        if (!this.tournamentId && !this.cupId) {
          throw new Error('Bracket must belong to either a tournament or a cup');
        }
        if (this.tournamentId && this.cupId) {
          throw new Error('Bracket cannot belong to both tournament and cup');
        }
      },
      validRoundNumbers() {
        if (this.currentRound > this.totalRounds) {
          throw new Error('Current round cannot be greater than total rounds');
        }
      },
    },
    indexes: [
      {
        unique: true,
        fields: ['tournament_id'],
        where: {
          tournament_id: { [sequelize.Sequelize.Op.ne]: null },
        },
      },
      {
        unique: true,
        fields: ['cup_id'],
        where: {
          cup_id: { [sequelize.Sequelize.Op.ne]: null },
        },
      },
      {
        fields: ['status'],
      },
      {
        fields: ['current_round'],
      },
      {
        fields: ['total_rounds'],
      },
    ],
  }
);

export default Bracket;