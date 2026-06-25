import { Response, NextFunction } from 'express';
import Task from '../models/Task';
import { AppError, catchAsync } from '../middleware/errorHandler';
import { AuthenticatedRequest, TaskStatus, TaskPriority } from '../types';

// ─── Create Task ──────────────────────────────────────────────────────────────

export const createTask = catchAsync(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title) {
      throw new AppError('Task title is required', 400);
    }

    const task = await Task.create({
      user: req.user?.id,
      title,
      description,
      status: status || TaskStatus.TODO,
      priority: priority || TaskPriority.MEDIUM,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  }
);

// ─── Get All Tasks ────────────────────────────────────────────────────────────

export const getTasks = catchAsync(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const { status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build filter object dynamically based on query params
    const filter: Record<string, unknown> = { user: req.user?.id };
    if (status) filter['status'] = status;
    if (priority) filter['priority'] = priority;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = sortBy as string;

    const tasks = await Task.find(filter)
      .sort({ [sortField]: sortOrder })
      .lean(); // .lean() returns plain JS objects instead of Mongoose documents
                // significantly faster for read-only operations

    res.status(200).json({
      success: true,
      data: {
        count: tasks.length,
        tasks,
      },
    });
  }
);

// ─── Get Single Task ──────────────────────────────────────────────────────────

export const getTask = catchAsync(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const task = await Task.findOne({
      _id: req.params['id'],
      user: req.user?.id, // Ensures users can only access their own tasks
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  }
);

// ─── Update Task ──────────────────────────────────────────────────────────────

export const updateTask = catchAsync(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'subtasks'];
    const updates: Record<string, unknown> = {};

    // Only pick fields that are explicitly allowed to be updated
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw new AppError('No valid fields provided for update', 400);
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params['id'], user: req.user?.id },
      updates,
      {
        new: true,        // Return the updated document
        runValidators: true, // Re-run schema validators on update
      }
    );

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  }
);

// ─── Delete Task ──────────────────────────────────────────────────────────────

export const deleteTask = catchAsync(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const task = await Task.findOneAndDelete({
      _id: req.params['id'],
      user: req.user?.id,
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: null,
    });
  }
);