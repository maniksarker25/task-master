import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import promoUseController from './promoUse.controller';
import promoUseValidations from './promoUse.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
    '/create-promo-use',
    auth(USER_ROLE.customer),
    validateRequest(promoUseValidations.createPromoUseZodSchema),
    promoUseController.createPromoUse
);

router.get(
    '/all-promo-use',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    promoUseController.getAllPromoUses
);

export const promoUseRoutes = router;
