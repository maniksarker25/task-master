import express from 'express';

import validateRequest from '../../middlewares/validateRequest';
import ProviderController from './provider.controller';

import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import ProviderValidations from './provider.validation';

const router = express.Router();

router.patch(
    '/update-provider',
    validateRequest(ProviderValidations.updateProviderZodSchema),
    ProviderController.updateProvider
);
router.get(
    '/all-provider',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    ProviderController.getAllProvider
);
router.get(
    '/get-single/:id',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    ProviderController.getSingleProvider
);
router.get(
    '/metaData',
    auth(USER_ROLE.provider),
    ProviderController.getProviderMetaData
);
export const providerRoutes = router;
