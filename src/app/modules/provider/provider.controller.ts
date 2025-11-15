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
    const result = await ProviderServices.getAllProviderFromDB(
        req.params.pageNum
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Provider get loockup successfully',
        data: result,
    });
});

const ProviderController = { getAllProvider, updateProvider };
export default ProviderController;
