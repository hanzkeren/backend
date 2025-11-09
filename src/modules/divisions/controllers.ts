import { Request, Response, NextFunction } from 'express';
import divisionService from './services';
import { catchAsync } from '@/middleware/errorHandler';

export interface GetAllDivisionsQuery extends Request {
  query: {
    page?: string;
    limit?: string;
    search?: string;
    isActive?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export interface CreateDivisionRequest extends Request {
  body: {
    name: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  };
}

export interface UpdateDivisionRequest extends Request {
  params: { id: string };
  body: {
    name?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  };
}

export interface ReorderDivisionsRequest extends Request {
  body: {
    divisions: { id: number; sortOrder: number }[];
  };
}

class DivisionController {
  /**
   * Get all divisions with pagination and filtering
   * GET /divisions
   */
  public getAllDivisions = catchAsync(async (req: GetAllDivisionsQuery, res: Response) => {
    const queryOptions = {
      page: req.query.page ? parseInt(req.query.page) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      search: req.query.search,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await divisionService.getAllDivisions(queryOptions);

    res.status(200).json({
      success: true,
      message: 'Divisions retrieved successfully',
      data: result,
    });
  });

  /**
   * Get active divisions only
   * GET /divisions/active
   */
  public getActiveDivisions = catchAsync(async (req: Request, res: Response) => {
    const divisions = await divisionService.getActiveDivisions();

    res.status(200).json({
      success: true,
      message: 'Active divisions retrieved successfully',
      data: { divisions },
    });
  });

  /**
   * Get division by ID
   * GET /divisions/:id
   */
  public getDivisionById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const divisionId = parseInt(id);

    if (isNaN(divisionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid division ID',
      });
    }

    const division = await divisionService.getDivisionById(divisionId);

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Division retrieved successfully',
      data: { division },
    });
  });

  /**
   * Create a new division
   * POST /divisions
   */
  public createDivision = catchAsync(async (req: CreateDivisionRequest, res: Response) => {
    const divisionData = req.body;

    const division = await divisionService.createDivision(divisionData);

    res.status(201).json({
      success: true,
      message: 'Division created successfully',
      data: { division },
    });
  });

  /**
   * Update division
   * PUT /divisions/:id
   */
  public updateDivision = catchAsync(async (req: UpdateDivisionRequest, res: Response) => {
    const { id } = req.params;
    const divisionId = parseInt(id);
    const updateData = req.body;

    if (isNaN(divisionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid division ID',
      });
    }

    const division = await divisionService.updateDivision(divisionId, updateData);

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Division updated successfully',
      data: { division },
    });
  });

  /**
   * Delete division
   * DELETE /divisions/:id
   */
  public deleteDivision = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const divisionId = parseInt(id);

    if (isNaN(divisionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid division ID',
      });
    }

    const deleted = await divisionService.deleteDivision(divisionId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Division not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Division deleted successfully',
    });
  });

  /**
   * Activate division
   * POST /divisions/:id/activate
   */
  public activateDivision = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const divisionId = parseInt(id);

    if (isNaN(divisionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid division ID',
      });
    }

    const division = await divisionService.activateDivision(divisionId);

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Division activated successfully',
      data: { division },
    });
  });

  /**
   * Deactivate division
   * POST /divisions/:id/deactivate
   */
  public deactivateDivision = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const divisionId = parseInt(id);

    if (isNaN(divisionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid division ID',
      });
    }

    const division = await divisionService.deactivateDivision(divisionId);

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Division deactivated successfully',
      data: { division },
    });
  });

  /**
   * Get division statistics
   * GET /divisions/:id/statistics
   */
  public getDivisionStatistics = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const divisionId = parseInt(id);

    if (isNaN(divisionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid division ID',
      });
    }

    const statistics = await divisionService.getDivisionStatistics(divisionId);

    if (!statistics) {
      return res.status(404).json({
        success: false,
        message: 'Division not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Division statistics retrieved successfully',
      data: statistics,
    });
  });

  /**
   * Reorder divisions
   * PUT /divisions/reorder
   */
  public reorderDivisions = catchAsync(async (req: ReorderDivisionsRequest, res: Response) => {
    const { divisions } = req.body;

    if (!Array.isArray(divisions)) {
      return res.status(400).json({
        success: false,
        message: 'Divisions must be an array',
      });
    }

    await divisionService.reorderDivisions(divisions);

    res.status(200).json({
      success: true,
      message: 'Divisions reordered successfully',
    });
  });
}

export default new DivisionController();