import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

export interface CupAttributes {
  id: number;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  divisionId: number;
  createdBy: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  cupType: 'knockout' | 'group' | 'league';
  maxParticipants?: number;
  registrationDeadline?: Date;
  rules?: string;
  prizeInfo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CupCreationAttributes extends Optional<CupAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'status' | 'maxParticipants' | 'registrationDeadline' | 'rules' | 'prizeInfo'> {}

class Cup extends Model<CupAttributes, CupCreationAttributes> implements CupAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public startDate!: Date;
  public endDate!: Date;
  public divisionId!: number;
  public createdBy!: number;
  public status!: 'planning' | 'active' | 'completed' | 'cancelled';
  public cupType!: 'knockout' | 'group' | 'league';
  public maxParticipants?: number;
  public registrationDeadline?: Date;
  public rules?: string;
  public prizeInfo?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public get isRegistrationOpen(): boolean {
    if (!this.registrationDeadline) return false;
    return new Date() < this.registrationDeadline && this.status === 'planning';
  }

  public get isUpcoming(): boolean {
    const now = new Date();
    return this.startDate > now && this.status === 'active';
  }

  public get isOngoing(): boolean {
    const now = new Date();
    return this.startDate <= now && this.endDate >= now && this.status === 'active';
  }

  public get isCompleted(): boolean {
    return this.status === 'completed' || (this.endDate < new Date() && this.status === 'active');
  }

  // Instance methods
  public async start(): Promise<void> {
    this.status = 'active';
    await this.save();
  }

  public async complete(): Promise<void> {
    this.status = 'completed';
    await this.save();
  }

  public async cancel(): Promise<void> {
    this.status = 'cancelled';
    await this.save();
  }

  public async updateDates(startDate: Date, endDate: Date): Promise<void> {
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }
    this.startDate = startDate;
    this.endDate = endDate;
    await this.save();
  }

  public isKnockout(): boolean {
    return this.cupType === 'knockout';
  }

  public isGroupStage(): boolean {
    return this.cupType === 'group';
  }

  public isLeague(): boolean {
    return this.cupType === 'league';
  }
}

Cup.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200],
      },
      set(value: string) {
        this.setDataValue('name', value.trim());
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfterToday(value: Date) {
          if (value <= new Date()) {
            throw new Error('Start date must be in the future');
          }
        },
      },
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfterStartDate(value: Date) {
          if (value <= this.startDate) {
            throw new Error('End date must be after start date');
          }
        },
      },
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
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    status: {
      type: DataTypes.ENUM('planning', 'active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'planning',
    },
    cupType: {
      type: DataTypes.ENUM('knockout', 'group', 'league'),
      allowNull: false,
      defaultValue: 'knockout',
    },
    maxParticipants: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      validate: {
        min: 2,
      },
    },
    registrationDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
        isBeforeStartDate(value: Date) {
          if (value && value >= this.startDate) {
            throw new Error('Registration deadline must be before start date');
          }
        },
      },
    },
    rules: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prizeInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'cups',
    sequelize,
    indexes: [
      {
        fields: ['division_id'],
      },
      {
        fields: ['created_by'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['cup_type'],
      },
      {
        fields: ['start_date'],
      },
      {
        fields: ['end_date'],
      },
      {
        fields: ['registration_deadline'],
      },
    ],
  }
);

export default Cup;