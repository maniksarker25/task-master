import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ProviderServices from './provider.service';

const getAllProvider = catchAsync(async (req, res) => {
    const result = await ProviderServices.getAllProviderFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Provider fetched successfully',
        data: result,
    });
});

const ProviderController = { getAllProvider };
export default ProviderController;
