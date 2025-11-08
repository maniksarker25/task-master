import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import questionValidations from './question.validation';
import questionController from './question.controller';
import { uploadFile } from '../../helper/fileUploader';

const router = express.Router();

router.post(
    '/create',
    auth(USER_ROLE.provider),
    uploadFile(),
    (req, res, next) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(questionValidations.createQuestionZodSchema),
    questionController.createQuestion
);

export const questionRoutes = router;
