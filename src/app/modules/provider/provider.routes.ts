import express from 'express';
import { uploadFile } from '../../helper/fileUploader';
import validateRequest from '../../middlewares/validateRequest';
import providerController from './provider.controller';
import providerValidations from './provider.validation';

const router = express.Router();

router.patch(
    '/update-profile',
    uploadFile(),
    (req, res, next) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    },
    validateRequest(providerValidations.updateProviderData),
    providerController.updateUserProfile
);

export const providerRoutes = router;
