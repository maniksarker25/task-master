import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import referralUseValidations from './referralUse.validation';
import referralUseController from './referralUse.controller';

const router = express.Router();

router.post(
    '/verify-referral-code',
    validateRequest(referralUseValidations.verifyReferralCodeZodSchema),
    auth(USER_ROLE.customer, USER_ROLE.provider),
    referralUseController.verifyReferralCode
);

export const referralUseRoutes = router;
