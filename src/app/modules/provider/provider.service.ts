import { Provider } from './provider.model';

const getAllProviderFromDB = async () => {
    const result = await Provider.find();
    return result;
};
const ProviderServices = {
    getAllProviderFromDB,
};
export default ProviderServices;
