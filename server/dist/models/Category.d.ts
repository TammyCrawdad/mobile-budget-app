import mongoose, { Document } from 'mongoose';
export interface ICategory extends Document {
    name: string;
    type: 'income' | 'expense';
    color: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Category: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory> & ICategory & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Category.d.ts.map