import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  name: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  category: mongoose.Types.ObjectId;
  date: Date;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: new Date(),
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ name: 'text', description: 'text' });

export const Transaction = mongoose.model<ITransaction>(
  'Transaction',
  transactionSchema
);
