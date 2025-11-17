import referralModel from './referral.model';

const getAllReferralFromDB = async () => {
    const result = await referralModel.find();
    return result;
};
const updateReferralValueFromDB = async (id: string, value: number) => {
    const result = await referralModel.findByIdAndUpdate(
        id,
        {
            value: value,
        },
        { new: true }
    );
    return result;
};

const ReferralServices = { getAllReferralFromDB, updateReferralValueFromDB };
export default ReferralServices;
