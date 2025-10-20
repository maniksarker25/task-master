import { model, Schema } from 'mongoose';
import { IReferralUse } from './referralUse.interface';
import { ENUM_REFERRAL_USE_STATUS } from './referralUse.enum';

const referralUseSchema = new Schema<IReferralUse>(
    {
        referrer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        referred: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(ENUM_REFERRAL_USE_STATUS),
            default: ENUM_REFERRAL_USE_STATUS.ACTIVE,
        },
        referral: {
            type: Schema.Types.ObjectId,
            ref: 'Referral',
            required: true,
        },
    },
    { timestamps: true }
);

const referralUseModel = model<IReferralUse>('ReferralUse', referralUseSchema);
export default referralUseModel;
