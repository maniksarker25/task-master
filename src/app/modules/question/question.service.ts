import httpStatus from 'http-status';
import AppError from '../../error/appError';
import TaskModel from '../task/task.model';
import { IQuestion } from './question.interface';
import QuestionModel from './question.model';

const createQuestionIntoDB = async (providerId: string, payload: IQuestion) => {
    // const task = await TaskModel.findById(payload.task);
    // if (!task) {
    //     throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    // }
    // const result = await QuestionModel.create({
    //     ...payload,
    //     provider: providerId,
    // });
    // return result;
    return { providerId, payload };
};
const QuestionServices = { createQuestionIntoDB };
export default QuestionServices;
