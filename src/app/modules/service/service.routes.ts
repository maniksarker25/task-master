import express from 'express';
import { uploadFile } from '../../helper/multer-s3-uploader';
import validateRequest from '../../middlewares/validateRequest';
import serviceController from './service.controller';
import ServiceValidations from './service.validation';

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
    validateRequest(ServiceValidations.createServiceZodSchema),
    serviceController.createService
);
router.get('/all-service', serviceController.getAllService);
export const serviceRoutes = router;
