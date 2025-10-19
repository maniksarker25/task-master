import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';

import bidController from './bid.controller';
import { uploadFile } from '../../helper/fileUploader';
import BidValidations from './bid.validation';

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
    validateRequest(BidValidations.updateBidData),
    bidController.updateUserProfile
);

export const bidRoutes = router;
