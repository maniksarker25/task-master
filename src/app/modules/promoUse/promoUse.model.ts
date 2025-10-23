import { model, Schema } from 'mongoose';
import { IPromoUse } from './promoUse.interface';

const promoUseSchema = new Schema<IPromoUse>(
    {
        promo: {
            type: Schema.Types.ObjectId,
            ref: 'Promo',
            required: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
        },
        service: {
            type: Schema.Types.ObjectId,
            ref: 'Service',
        },
        usedDate: {
            type: Date,
        },
    },
    { timestamps: true }
);

const promoUseModel = model<IPromoUse>('PromoUse', promoUseSchema);
export default promoUseModel;
