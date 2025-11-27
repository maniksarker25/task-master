import { Customer } from '../customer/customer.model';
import { Provider } from '../provider/provider.model';
import Transaction from './transaction.model';

const getMyTransaction = async (id: string, role: 'customer' | 'provider') => {
    let myProfile;

    if (role === 'customer') {
        myProfile = await Customer.findById(id);
    } else if (role === 'provider') {
        myProfile = await Provider.findById(id);
    }

    if (!myProfile) {
        throw new Error('Profile not found');
    }

    const result = await Transaction.find({
        user: myProfile._id,
    });

    return result;
};

const getAllTransaction = async () => {
    const result = await Transaction.find();
    return result;
};

const TransactionServices = { getMyTransaction, getAllTransaction };
export default TransactionServices;
