import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';

import BidValidations from './bid.validation';
import BidController from './bid.controller';

const router = express.Router();

router.post(
    '/create-bid',
    auth(USER_ROLE.provider),
    validateRequest(BidValidations.createBidZodSchema),
    BidController.createBidIntoDB
);

router.get('/all-bid', BidController.getAllBidFromDB);
router.delete(
    '/delete-bid/:id',
    auth(USER_ROLE.provider),
    BidController.deleteBidFromDB
);

export const bidRoutes = router;
