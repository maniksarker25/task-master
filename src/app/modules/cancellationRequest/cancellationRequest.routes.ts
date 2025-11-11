import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import cancellationRequestValidations from './cancellationRequest.validation';
import cancellationRequestController from './cancellationRequest.controller';
import { uploadFile } from '../../helper/multer-s3-uploader';

const router = express.Router();

router.post(
    '/create',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    uploadFile(),
    (req, res, next) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(
        cancellationRequestValidations.createCancellationRequestZodSchema
    ),
    cancellationRequestController.createCancellationRequest
);

router.get(
    '/byTask/:taskId',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    cancellationRequestController.getCancellationRequestByTask
);

router.delete(
    '/delete/:id',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    cancellationRequestController.cancelCancellationRequest
);

router.patch(
    '/acceptRequest/:id',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    cancellationRequestController.acceptCancellationRequest
);

router.patch(
    '/rejectRequest/:id',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    uploadFile(),
    (req, res, next) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(
        cancellationRequestValidations.rejectCancellationRequestZodSchema
    ),
    cancellationRequestController.rejectCancellationRequest
);

export const cancellationRequestRoutes = router;
