import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

export interface LeaderboardEntry {
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface LeaderboardAttributes {
  id: number;
  divisionId: number;
  standings: LeaderboardEntry[]; // JSON array of leaderboard entries
  lastUpdated: Date;
  season?: string;
  tournamentId?: number;
  cupId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeaderboardCreationAttributes extends Optional<LeaderboardAttributes, 'id' | 'createdAt' | 'updatedAt' | 'season' | 'tournamentId' | 'cupId'> {}

class Leaderboard extends Model<LeaderboardAttributes, LeaderboardCreationAttributes> implements LeaderboardAttributes {
  public id!: number;
  public divisionId!: number;
  public standings!: LeaderboardEntry[];
  public lastUpdated!: Date;
  public season?: string;
  public tournamentId?: number;
  public cupId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public get isDivisionLeaderboard(): boolean {
    return !this.tournamentId && !this.cupId;
  }

  public get isTournamentLeaderboard(): boolean {
    return this.tournamentId !== undefined && this.tournamentId !== null;
  }

  public get isCupLeaderboard(): boolean {
    return this.cupId !== undefined && this.cupId !== null;
  }

  public get getTeamCount(): number {
    return this.standings.length;
  }

  public get getTopTeam(): LeaderboardEntry | null {
    if (this.standings.length === 0) return null;
    return this.standings[0]; // Assuming standings are sorted by points
  }

  // Instance methods
  public getTeamStanding(teamName: string): LeaderboardEntry | null {
    return this.standings.find(entry => entry.teamName.toLowerCase() === teamName.toLowerCase()) || null;
  }

  public getTopTeams(count: number): LeaderboardEntry[] {
    return this.standings.slice(0, count);
  }

  public addOrUpdateTeam(entry: LeaderboardEntry): void {
    const existingIndex = this.standings.findIndex(
      standing => standing.teamName.toLowerCase() === entry.teamName.toLowerCase()
    );

    if (existingIndex >= 0) {
      this.standings[existingIndex] = entry;
    } else {
      this.standings.push(entry);
    }

    this.sortStandings();
  }

  public removeTeam(teamName: string): boolean {
    const index = this.standings.findIndex(
      standing => standing.teamName.toLowerCase() === teamName.toLowerCase()
    );

    if (index >= 0) {
      this.standings.splice(index, 1);
      return true;
    }
    return false;
  }

  public sortStandings(): void {
    this.standings.sort((a, b) => {
      // Primary sort: points (descending)
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      // Secondary sort: goal difference (descending)
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      // Tertiary sort: goals for (descending)
      if (b.goalsFor !== a.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }
      // Final sort: team name (ascending)
      return a.teamName.localeCompare(b.teamName);
    });
  }

  public async updateStandings(newStandings: LeaderboardEntry[]): Promise<void> {
    this.standings = newStandings;
    this.sortStandings();
    this.lastUpdated = new Date();
    await this.save();
  }

  public async refreshTimestamp(): Promise<void> {
    this.lastUpdated = new Date();
    await this.save();
  }

  // Static method to create leaderboard entry from match result
  public static createEntryFromMatch(
    teamName: string,
    existingEntry: LeaderboardEntry | null,
    isHome: boolean,
    homeScore: number,
    awayScore: number
  ): LeaderboardEntry {
    const baseEntry = existingEntry || {
      teamName,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    };

    const teamScore = isHome ? homeScore : awayScore;
    const opponentScore = isHome ? awayScore : homeScore;

    baseEntry.played += 1;
    baseEntry.goalsFor += teamScore;
    baseEntry.goalsAgainst += opponentScore;
    baseEntry.goalDifference = baseEntry.goalsFor - baseEntry.goalsAgainst;

    if (teamScore > opponentScore) {
      baseEntry.won += 1;
      baseEntry.points += 3;
    } else if (teamScore === opponentScore) {
      baseEntry.drawn += 1;
      baseEntry.points += 1;
    } else {
      baseEntry.lost += 1;
    }

    return baseEntry;
  }
}

Leaderboard.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    divisionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'divisions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    standings: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isStandingsValid(value: LeaderboardEntry[]) {
          if (!Array.isArray(value)) {
            throw new Error('Standings must be an array');
          }
          value.forEach((entry, index) => {
            if (!entry.teamName || typeof entry.teamName !== 'string') {
              throw new Error(`Entry ${index}: teamName is required and must be a string`);
            }
            if (typeof entry.played !== 'number' || entry.played < 0) {
              throw new Error(`Entry ${index}: played must be a non-negative number`);
            }
            if (typeof entry.won !== 'number' || entry.won < 0) {
              throw new Error(`Entry ${index}: won must be a non-negative number`);
            }
            if (typeof entry.drawn !== 'number' || entry.drawn < 0) {
              throw new Error(`Entry ${index}: drawn must be a non-negative number`);
            }
            if (typeof entry.lost !== 'number' || entry.lost < 0) {
              throw new Error(`Entry ${index}: lost must be a non-negative number`);
            }
            if (typeof entry.goalsFor !== 'number' || entry.goalsFor < 0) {
              throw new Error(`Entry ${index}: goalsFor must be a non-negative number`);
            }
            if (typeof entry.goalsAgainst !== 'number' || entry.goalsAgainst < 0) {
              throw new Error(`Entry ${index}: goalsAgainst must be a non-negative number`);
            }
            if (typeof entry.points !== 'number' || entry.points < 0) {
              throw new Error(`Entry ${index}: points must be a non-negative number`);
            }
          });
        },
      },
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    season: {
      type: DataTypes.STRING(20),
      allowNull: true,
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
  },
  {
    tableName: 'leaderboards',
    sequelize,
    validate: {
      eitherTournamentOrCup() {
        if (this.tournamentId && this.cupId) {
          throw new Error('Leaderboard cannot belong to both tournament and cup');
        }
      },
    },
    indexes: [
      {
        fields: ['division_id'],
      },
      {
        fields: ['tournament_id'],
      },
      {
        fields: ['cup_id'],
      },
      {
        fields: ['season'],
      },
      {
        fields: ['last_updated'],
      },
      {
        unique: true,
        fields: ['division_id', 'tournament_id'],
        where: {
          tournament_id: { [sequelize.Sequelize.Op.ne]: null },
          cup_id: null,
        },
      },
      {
        unique: true,
        fields: ['division_id', 'cup_id'],
        where: {
          cup_id: { [sequelize.Sequelize.Op.ne]: null },
          tournament_id: null,
        },
      },
      {
        unique: true,
        fields: ['division_id', 'season'],
        where: {
          tournament_id: null,
          cup_id: null,
        },
      },
    ],
  }
);

export default Leaderboard;