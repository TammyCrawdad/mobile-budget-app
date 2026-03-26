import mongoose, { Document } from 'mongoose';
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
export declare const Transaction: mongoose.Model<ITransaction, {}, {}, {}, mongoose.Document<unknown, {}, ITransaction> & ITransaction & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Transaction.d.ts.map