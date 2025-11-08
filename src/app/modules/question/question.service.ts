import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IQuestion } from './question.interface';
import questionModel from './question.model';
import QuestionModel from './question.model';

const createQusctionIntoDB = async (payload: ICategory) => {
    const result = await QuestionModel.create(payload);
    return result;
};
const QuestionServices = { updateUserProfile };
export default QuestionServices;
