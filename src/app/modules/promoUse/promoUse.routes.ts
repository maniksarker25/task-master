import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import promoUseValidations from './promoUse.validation';
import promoUseController from './promoUse.controller';

const router = express.Router();

router.post(
    '/create-promo-use',
    auth(USER_ROLE.customer),
    validateRequest(promoUseValidations.createPromoUseZodSchema),
    promoUseController.createPromoUse
);

router.patch(
    '/update-promo-use/:id',
    auth(USER_ROLE.customer),
    validateRequest(promoUseValidations.updatePromoUseZodSchema),
    promoUseController.updatePromoUse
);

router.get('/all-promo-use', promoUseController.getAllPromoUses);

export const promoUseRoutes = router;
