import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IProvider } from './provider.interface';
import { Provider } from './provider.model';

const getAllProviderFromDB = async () => {
    const result = await Provider.find();
    return result;
};
const updateProviderFromDB = async (
    id: string,
    payload: Partial<IProvider>
) => {
    const result = await Provider.findByIdAndUpdate(
        id,
        { $set: payload },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Provider not found');
    }

    return result;
};
const ProviderServices = {
    getAllProviderFromDB,
    updateProviderFromDB,
};
export default ProviderServices;
