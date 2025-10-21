import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import CustomerValidations from '../customer/customer.validation';
import { USER_ROLE } from './user.constant';
import userControllers from './user.controller';
import userValidations from './user.validation';

const router = Router();

router.post(
    '/register-customer',
    validateRequest(CustomerValidations.createCustomerSchema),
    userControllers.registerUser
);
//
router.post(
    '/verify-code',
    validateRequest(userValidations.verifyCodeValidationSchema),
    userControllers.verifyCode
);

router.post(
    '/resend-verify-code',
    validateRequest(userValidations.resendVerifyCodeSchema),
    userControllers.resendVerifyCode
);

router.get(
    '/get-my-profile',
    auth(
        USER_ROLE.customer,
        USER_ROLE.provider,
        USER_ROLE.admin,
        USER_ROLE.superAdmin
    ),
    userControllers.getMyProfile
);
//===
router.patch(
    '/change-status/:id',
    auth(USER_ROLE.superAdmin),
    validateRequest(userValidations.changeUserStatus),
    userControllers.changeUserStatus
);
router.post(
    '/delete-account',
    auth(USER_ROLE.customer),
    validateRequest(userValidations.deleteUserAccountValidationSchema),
    userControllers.deleteUserAccount
);

export const userRoutes = router;
