import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ProviderServices from './provider.service';

const updateProvider = catchAsync(async (req, res) => {
    const { id, data } = req.body;
    const result = await ProviderServices.updateProviderFromDB(id, data);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Provider Update successfully',
        data: result,
    });
});
const getAllProvider = catchAsync(async (req, res) => {
    const result = await ProviderServices.getAllProviderFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Provider get loockup successfully',
        data: result,
    });
});
const getSingleProvider = catchAsync(async (req, res) => {
    const result = await ProviderServices.getSingleProvider(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Single provider retrieved successfully',
        data: result,
    });
});

const getProviderMetaData = catchAsync(async (req, res) => {
    const result = await ProviderServices.getProviderMetaDataFromDB(
        req.user.profileId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Provider meta data retrieved successfully',
        data: result,
    });
});

const ProviderController = {
    getAllProvider,
    updateProvider,
    getSingleProvider,
    getProviderMetaData,
};
export default ProviderController;
