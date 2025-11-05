/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { getCloudFrontUrl } from '../../helper/multer-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';

import TaskServices from './task.service';

const createTask = catchAsync(async (req, res) => {
    if (req.files?.task_attachments) {
        req.body.task_attachments = req.files.task_attachments.map(
            (file: any) => {
                return getCloudFrontUrl(file.key);
            }
        );
    }

    const result = await TaskServices.createTaskIntoDB(
        req.user.profileId,
        req?.body
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task created successfully',
        data: result,
    });
});

const getAllTask = catchAsync(async (req, res) => {
    const result = await TaskServices.getAllTaskFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task retrieved successfully',
        data: result,
    });
});
const getMyTask = catchAsync(async (req, res) => {
    const result = await TaskServices.getMyTaskFromDB(
        req.user.profileId,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task retrieved successfully',
        data: result,
    });
});
const getSingleTask = catchAsync(async (req, res) => {
    const id = req.params.id;

    const result = await TaskServices.getSingleTaskFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task retrieved successfully 1',
        data: result,
    });
});
const deleteTask = catchAsync(async (req, res) => {
    const { id } = req.params;

    await TaskServices.deleteTaskFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task deleted successfully',
        data: null,
    });
});

const TaskController = {
    createTask,
    getAllTask,
    getSingleTask,
    deleteTask,
    getMyTask,
};
export default TaskController;
