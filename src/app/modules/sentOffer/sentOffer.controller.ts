import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import sentOfferServices from './sentOffer.service';
// make some changews
const updateUserProfile = catchAsync(async (req, res) => {
    const result = await sentOfferServices.updateUserProfile(
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

const SentOfferController = { updateUserProfile };
export default SentOfferController;
