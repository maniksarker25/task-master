import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import questionServices from './question.service';

const createQuestion  = catchAsync(async(req,res)=>{
         const file: any = req.files?.question_image;
    if (req.files?.category_image) {
        req.body.category_image = getCloudFrontUrl(file[0].key);
    }
      const result = await  .createCategoryIntoDB(req?.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Category created successfully',
        data: result,
    });

})

const QuestionController = { updateUserProfile };
export default QuestionController;
