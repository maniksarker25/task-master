import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';

import { getCloudFrontUrl } from '../../helper/multer-s3-uploader';
import QuestionServices from './question.service';

const createQuestion = catchAsync(async (req, res) => {
    const file: any = req.files?.question_image;

    if (req.files?.question_image) {
        req.body.question_image = getCloudFrontUrl(file[0].key);
    }

    const result = await QuestionServices.createQuestionIntoDB(
        req.user.profileId,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Question created successfully',
        data: result,
    });
});

const QuestionController = { createQuestion };
export default QuestionController;
