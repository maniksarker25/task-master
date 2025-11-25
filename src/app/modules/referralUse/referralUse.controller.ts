import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import referralUseServices from './referralUse.service';

// const updateUserProfile = catchAsync(async (req, res) => {
//     const { files } = req;
//     if (files && typeof files === "object" && "profile_image" in files) {
//         req.body.profile_image = files["profile_image"][0].path;
//     }
//     const result = await referralUseServices.updateUserProfile(
//         req.user.profileId,
//         req.body
//     );
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: "Profile updated successfully",
//         data: result,
//     });
// });

const verifyReferralCode = catchAsync(async (req, res) => {
    const result = await referralUseServices.verifyReferralCodeFromDB(
        req.body.code,
        req.user.profileId,
        req.user.role
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Verify Referral Code successful',
        data: result,
    });
});

const ReferralUseController = { verifyReferralCode };
export default ReferralUseController;
