import express from 'express';

import ProviderController from './provider.controller';
import validateRequest from '../../middlewares/validateRequest';

import ProviderValidations from './provider.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.patch(
    '/update-provider',
    validateRequest(ProviderValidations.updateProviderZodSchema),
    ProviderController.updateProvider
);
router.get(
    '/all-provider/:pageNum',
    auth(USER_ROLE.admin),
    ProviderController.getAllProvider
);

export const providerRoutes = router;
