import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import faqServices from './faq.service';

// const updateUserProfile = catchAsync(async (req, res) => {
//     const { files } = req;
//     if (files && typeof files === "object" && "profile_image" in files) {
//         req.body.profile_image = files["profile_image"][0].path;
//     }
//     const result = await faqServices.updateUserProfile(
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
const createFaq = catchAsync(async (req, res) => {
    const result = await faqServices.createFaqIntoDB(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'FAQ created successfully',
        data: result,
    });
});

const getAllFaq = catchAsync(async (req, res) => {
    const result = await faqServices.getAllFaqFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'FAQ retrieved successfully',
        data: result,
    });
});

const updateFaq = catchAsync(async (req, res) => {
    const result = await faqServices.updateFaqIntoDB(req.params.id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'FAQ updated successfully',
        data: result,
    });
});

const deleteFaq = catchAsync(async (req, res) => {
    const result = await faqServices.deleteFaqFromDB(req.params.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'FAQ deleted successfully',
        data: result,
    });
});
const FaqController = { createFaq, getAllFaq, updateFaq, deleteFaq };
export default FaqController;
