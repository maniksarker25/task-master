import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import promoUseController from './promoUse.controller';
import promoUseValidations from './promoUse.validation';

const router = express.Router();

router.post(
    '/create-promo-use',
    // auth(USER_ROLE.customer),
    validateRequest(promoUseValidations.createPromoUseZodSchema),
    promoUseController.createPromoUse
);

router.patch(
    '/update-promo-use/:id',
    // auth(USER_ROLE.customer),
    validateRequest(promoUseValidations.updatePromoUseZodSchema),
    promoUseController.updatePromoUse
);

router.get('/all-promo-use', promoUseController.getAllPromoUses);

export const promoUseRoutes = router;
