import { IService } from './service.interface';
import serviceModel from './service.model';

const createServiceIntoDB = async (userId: string, payload: IService) => {
    const result = serviceModel.create({ ...payload, provider: userId });
    return result;
};

const getAllServiceFromDB = async () => {
    const result = await serviceModel.find().populate('provider category');
    return result;
};

const ServiceServices = { createServiceIntoDB, getAllServiceFromDB };
export default ServiceServices;
