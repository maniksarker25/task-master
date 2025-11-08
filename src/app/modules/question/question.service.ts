import { IQuestion } from './question.interface';
import QuestionModel from './question.model';

const createQuestionIntoDB = async (providerId: string, payload: IQuestion) => {
    const result = await QuestionModel.create({
        ...payload,
        provider: providerId,
    });
    return result;
};
const QuestionServices = { createQuestionIntoDB };
export default QuestionServices;
