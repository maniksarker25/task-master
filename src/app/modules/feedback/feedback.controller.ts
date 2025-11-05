import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';

import feedbackServices from './feedback.service';
import sendResponse from '../../utilities/sendResponse';

const createFeedback = catchAsync(async (req, res) => {
    const currentUserID = req.user.profileId;
    const result = await feedbackServices.createFeedbackIntoDB(
        currentUserID,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'FeedBack updated successfully',
        data: result,
    });
});

const FeedbackController = { createFeedback };
export default FeedbackController;
