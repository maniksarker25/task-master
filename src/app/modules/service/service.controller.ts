/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { getCloudFrontUrl } from '../../helper/multer-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import serviceServices from './service.service';

const createService = catchAsync(async (req, res) => {
    if (req.files?.service_image) {
        req.body.images = req.files.service_image.map((file: any) => {
            return getCloudFrontUrl(file.key);
        });
    }
    const result = await serviceServices.createServiceIntoDB(
        req.user?.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Service Create Successfully',
        data: result,
    });
});
const getAllService = catchAsync(async (req, res) => {
    const result = await serviceServices.getAllServiceFromDB(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Service Get Successfully',
        data: result,
    });
});
const deleteService = catchAsync(async (req, res) => {
    const profileId = req.user?.profileId;
    const serviceId = req.body.serviceId;
    const result = await serviceServices.deleteServiceFromDB(
        profileId,
        serviceId
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Delete Service  Successfully',
        data: result,
    });
});
const getSingleService = catchAsync(async (req, res) => {
    const serviceId = req.body.serviceId;
    const result = await serviceServices.getSingleServiceFromDB(serviceId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Single Service get Successfully',
        data: result,
    });
});
const updateService = catchAsync(async (req, res) => {
    const serviceId = req.body.serviceId;
    const updateData = req.body;
    const result = await serviceServices.updateServiceFromDB(
        serviceId,
        updateData
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Single Service get Successfully',
        data: result,
    });
});

const ServiceController = {
    createService,
    getAllService,
    deleteService,
    getSingleService,

    updateService,
};
export default ServiceController;
