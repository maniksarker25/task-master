import express from 'express';
import { uploadFile } from '../../helper/multer-s3-uploader';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import cancellationRequestController from './cancellationRequest.controller';
import cancellationRequestValidations from './cancellationRequest.validation';

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
    '/accept-reject/:id',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    uploadFile(),
    (req, res, next) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(cancellationRequestValidations.acceptRejectZodSchema),
    cancellationRequestController.handleAcceptRejectCancellationRequest
);

router.patch(
    '/make-dispute/:id',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    cancellationRequestController.makeDisputeForAdmin
);

export const cancellationRequestRoutes = router;
