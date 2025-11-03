import express from 'express';

import ProviderController from './provider.controller';

const router = express.Router();

router.get('/all-provider', ProviderController.getAllProvider);

export const providerRoutes = router;
