import mongoose, { Schema, Model } from 'mongoose';
import { ITask, ISubtask, TaskStatus, TaskPriority } from '../types';

const subtaskSchema = new Schema<ISubtask>(
  {
    title: {
      type: String,
      required: [true, 'Subtask title is required'],
      trim: true,
      maxlength: [200, 'Subtask title cannot exceed 200 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const taskSchema = new Schema<ITask>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TaskStatus),
        message: '{VALUE} is not a valid status',
      },
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(TaskPriority),
        message: '{VALUE} is not a valid priority',
      },
      default: TaskPriority.MEDIUM,
    },
    dueDate: {
      type: Date,
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret['id'] = ret['_id'];
        delete ret['_id'];
        delete ret['__v'];
        return ret;
      },
    },
  }
);

taskSchema.index({ user: 1, status: 1, dueDate: 1 });

const Task: Model<ITask> = mongoose.model<ITask>('Task', taskSchema);
export default Task;