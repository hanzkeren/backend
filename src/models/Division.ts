import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@/config/database';

export interface DivisionAttributes {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DivisionCreationAttributes extends Optional<DivisionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'isActive' | 'sortOrder'> {}

class Division extends Model<DivisionAttributes, DivisionCreationAttributes> implements DivisionAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public isActive!: boolean;
  public sortOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async activate(): Promise<void> {
    this.isActive = true;
    await this.save();
  }

  public async deactivate(): Promise<void> {
    this.isActive = false;
    await this.save();
  }
}

Division.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
      set(value: string) {
        this.setDataValue('name', value.trim());
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'divisions',
    sequelize,
    indexes: [
      {
        unique: true,
        fields: ['name'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['sort_order'],
      },
    ],
  }
);

export default Division;