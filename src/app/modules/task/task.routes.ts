import express from 'express';
import { uploadFile } from '../../helper/fileUploader';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import taskController from './task.controller';
import taskValidations from './task.validation';

const router = express.Router();

router.post(
    '/create-task',
    auth(USER_ROLE.customer),
    uploadFile(),
    (req, res, next) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(taskValidations.createTaskZodSchema),
    taskController.createTask
);

export const taskRoutes = router;
