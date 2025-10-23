import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import promoUseValidations from './promoUse.validation';
import promoUseController from './promoUse.controller';
import { uploadFile } from '../../helper/fileUploader';

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
    validateRequest(promoUseValidations.updatePromoUseData),
    promoUseController.updateUserProfile
);

router.

export const promoUseRoutes = router;
