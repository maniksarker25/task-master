import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import promoValidations from './promo.validation';
import promoController from './promo.controller';

const router = express.Router();

router.post(
    '/create-promo',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),

    validateRequest(promoValidations.createPromoZodSchema),
    promoController.createPromo
);

router.get(
    '/all-promo',

    promoController.getAllPromo
);

router.get('/single-promo/:id', promoController.getSinglePromo);

router.put(
    '/update-promo/:id',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    validateRequest(promoValidations.updatePromoZodSchema),
    promoController.updatePromo
);

router.delete(
    '/delete-promo/:id',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    promoController.deletePromo
);
export const promoRoutes = router;
