import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import providerServices from './provider.service';

const updateUserProfile = catchAsync(async (req, res) => {
    const result = await providerServices.updateUserProfile(
        req.user.profileId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Profile updated successfully',
        data: result,
    });
});

const ProviderController = { updateUserProfile };
export default ProviderController;
