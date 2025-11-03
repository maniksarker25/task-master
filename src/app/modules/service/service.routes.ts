import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import serviceController from './service.controller';
import ServiceValidations from './service.validation';

const router = express.Router();

router.post(
    '/create-service',
    validateRequest(ServiceValidations.createServiceZodSchema),
    serviceController.createService
);
router.get('/all-service', serviceController.getAllService);
export const serviceRoutes = router;
