import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import serviceServices from './service.service';

const createService = catchAsync(async (req, res) => {
    const result = await serviceServices.createServiceIntoDB(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Service Create Successfully',
        data: result,
    });
});
const getAllService = catchAsync(async (req, res) => {
    const result = await serviceServices.getAllServiceFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Service Get Successfully',
        data: result,
    });
});

const ServiceController = { createService, getAllService };
export default ServiceController;
