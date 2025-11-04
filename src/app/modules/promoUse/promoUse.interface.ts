import { Types } from 'mongoose';

export interface IPromoUse {
    promo: Types.ObjectId;
    customer: Types.ObjectId;
    task?: Types.ObjectId;
    service?: Types.ObjectId;
    usedDate?: Date;
}
