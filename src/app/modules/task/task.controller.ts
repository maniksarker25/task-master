import catchAsync from '../../utilities/catchasync';

const createTask = catchAsync(async (req, res) => {
    const file: any = req.files?.category_image;
    console.log(file);
    //   if (req.files?.category_image) {
    //     req.body.category_image = getCloudFrontUrl(file[0].key);
    // }
    // const result = await categoryService.createCategoryIntoDB(req?.body);
    // //
    // sendResponse(res, {
    //     statusCode: httpStatus.OK,
    //     success: true,
    //     message: 'Category created successfully',
    //     data: result,
    // });
});

const TaskController = { createTask };
export default TaskController;
