import express from 'express';

import ProviderController from './provider.controller';
import validateRequest from '../../middlewares/validateRequest';

import ProviderValidations from './provider.validation';

const router = express.Router();

router.get('/all-provider', ProviderController.getAllProvider);
router.patch(
    '/update-provider',
    validateRequest(ProviderValidations.updateProviderZodSchema),
    ProviderController.updateProvider
);

export const providerRoutes = router;
