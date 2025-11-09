import { Division } from '@/models';
import { Op } from 'sequelize';

export interface CreateDivisionDto {
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateDivisionDto {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface DivisionQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedDivisionsResponse {
  divisions: Division[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

class DivisionService {
  /**
   * Get all divisions with pagination and filtering
   */
  public async getAllDivisions(queryOptions: DivisionQueryOptions): Promise<PaginatedDivisionsResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = queryOptions;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        {
          name: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          description: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }

    // Build order clause
    const orderClause: any[] = [];
    if (sortBy) {
      orderClause.push([sortBy, sortOrder.toUpperCase()]);
    } else {
      orderClause.push(['sortOrder', 'ASC'], ['name', 'ASC']);
    }

    const { count, rows: divisions } = await Division.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit.toString()),
      offset: offset,
      order: orderClause,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      divisions: divisions.map(division => division.toJSON() as Division),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get division by ID
   */
  public async getDivisionById(id: number): Promise<Division | null> {
    const division = await Division.findByPk(id);
    return division ? (division.toJSON() as Division) : null;
  }

  /**
   * Create a new division
   */
  public async createDivision(divisionData: CreateDivisionDto): Promise<Division> {
    const { name, description, sortOrder = 0, isActive = true } = divisionData;

    // Check if division name already exists
    const existingDivision = await Division.findOne({
      where: {
        name: name.trim(),
      },
    });

    if (existingDivision) {
      throw new Error('Division with this name already exists');
    }

    // Create the division
    const division = await Division.create({
      name: name.trim(),
      description: description?.trim(),
      sortOrder,
      isActive,
    });

    const divisionResponse = division.toJSON();
    return divisionResponse as Division;
  }

  /**
   * Update division
   */
  public async updateDivision(id: number, updateData: UpdateDivisionDto): Promise<Division | null> {
    const division = await Division.findByPk(id);
    if (!division) {
      return null;
    }

    // Check if name is being updated and if it already exists
    if (updateData.name !== undefined && updateData.name.trim() !== division.name) {
      const existingDivision = await Division.findOne({
        where: {
          name: updateData.name.trim(),
          id: { [Op.ne]: id },
        },
      });

      if (existingDivision) {
        throw new Error('Division with this name already exists');
      }
    }

    // Update allowed fields
    if (updateData.name !== undefined) {
      division.name = updateData.name.trim();
    }
    if (updateData.description !== undefined) {
      division.description = updateData.description?.trim();
    }
    if (updateData.sortOrder !== undefined) {
      division.sortOrder = updateData.sortOrder;
    }
    if (updateData.isActive !== undefined) {
      division.isActive = updateData.isActive;
    }

    await division.save();

    const divisionResponse = division.toJSON();
    return divisionResponse as Division;
  }

  /**
   * Delete division
   */
  public async deleteDivision(id: number): Promise<boolean> {
    const division = await Division.findByPk(id);
    if (!division) {
      return false;
    }

    // Check if division has associated tournaments, cups, or matches
    const [tournamentCount, cupCount, matchCount] = await Promise.all([
      division.countTournaments(),
      division.countCups(),
      division.countMatches(),
    ]);

    if (tournamentCount > 0 || cupCount > 0 || matchCount > 0) {
      throw new Error('Cannot delete division with associated tournaments, cups, or matches');
    }

    await division.destroy();
    return true;
  }

  /**
   * Get active divisions only
   */
  public async getActiveDivisions(): Promise<Division[]> {
    const divisions = await Division.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    return divisions.map(division => division.toJSON() as Division);
  }

  /**
   * Activate division
   */
  public async activateDivision(id: number): Promise<Division | null> {
    const division = await Division.findByPk(id);
    if (!division) {
      return null;
    }

    await division.activate();
    const divisionResponse = division.toJSON();
    return divisionResponse as Division;
  }

  /**
   * Deactivate division
   */
  public async deactivateDivision(id: number): Promise<Division | null> {
    const division = await Division.findByPk(id);
    if (!division) {
      return null;
    }

    await division.deactivate();
    const divisionResponse = division.toJSON();
    return divisionResponse as Division;
  }

  /**
   * Get division statistics
   */
  public async getDivisionStatistics(id: number): Promise<{
    division: Division;
    tournamentsCount: number;
    cupsCount: number;
    matchesCount: number;
    activeTournaments: number;
    activeCups: number;
  } | null> {
    const division = await Division.findByPk(id);
    if (!division) {
      return null;
    }

    const [tournamentsCount, cupsCount, matchesCount, activeTournaments, activeCups] = await Promise.all([
      division.countTournaments(),
      division.countCups(),
      division.countMatches(),
      division.countTournaments({ where: { status: 'active' } }),
      division.countCups({ where: { status: 'active' } }),
    ]);

    return {
      division: division.toJSON() as Division,
      tournamentsCount,
      cupsCount,
      matchesCount,
      activeTournaments,
      activeCups,
    };
  }

  /**
   * Reorder divisions
   */
  public async reorderDivisions(divisionsOrder: { id: number; sortOrder: number }[]): Promise<void> {
    const transaction = await Division.sequelize!.transaction();

    try {
      for (const { id, sortOrder } of divisionsOrder) {
        await Division.update(
          { sortOrder },
          { where: { id }, transaction }
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new DivisionService();