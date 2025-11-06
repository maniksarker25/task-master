import express from 'express';
import { uploadFile } from '../../helper/multer-s3-uploader';
import validateRequest from '../../middlewares/validateRequest';
import serviceController from './service.controller';
import ServiceValidations from './service.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
    '/create-service',
    uploadFile(),
    (req, res, next) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    auth(USER_ROLE.provider),
    validateRequest(ServiceValidations.createServiceZodSchema),
    serviceController.createService
);
router.get('/all-service', serviceController.getAllService);
router.delete(
    '/delete-service',
    auth(USER_ROLE.provider),
    serviceController.deleteService
);
router.get(
    '/get-single-service',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    serviceController.getSingleService
);

export const serviceRoutes = router;
