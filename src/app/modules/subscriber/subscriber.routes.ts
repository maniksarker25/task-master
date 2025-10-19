import express from 'express';
import { uploadFile } from '../../helper/fileUploader';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import subscriberController from './subscriber.controller';
import subscriberValidations from './subscriber.validation';

const router = express.Router();

router.patch(
    '/update-profile',
    auth(USER_ROLE.user),
    uploadFile(),
    (req, res, next) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(subscriberValidations.updateSubscriberData),
    subscriberController.updateUserProfile
);

export const subscriberRoutes = router;
