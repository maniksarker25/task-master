import express from 'express';
import { uploadFile } from '../../helper/multer-s3-uploader';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import extensionRequestController from './extensionRequest.controller';
import extensionRequestValidations from './extensionRequest.validation';

const router = express.Router();

router.post(
    '/create',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    validateRequest(
        extensionRequestValidations.createExtensionRequestZodSchema
    ),
    extensionRequestController.createExtensionRequest
);
router.get(
    '/byTask/:taskId',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    extensionRequestController.extensionRequestByTask
);
router.delete(
    '/delete/:id',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    extensionRequestController.cancelExtensionRequestByTask
);
router.patch(
    '/acceptRequest/:id',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    extensionRequestController.acceptRequest
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
        extensionRequestValidations.rejectExtensionRequestZodSchema
    ),

    extensionRequestController.rejectRequest
);

router.post(
    '/make-dispute-for-admin/:id',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    extensionRequestController.makeDisputeForAdmin
);

export const extensionRequestRoutes = router;
