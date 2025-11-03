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
    const result = await Provider.findByIdAndUpdate(id, payload);
    return result;
};
const ProviderServices = {
    getAllProviderFromDB,
    updateProviderFromDB,
};
export default ProviderServices;
