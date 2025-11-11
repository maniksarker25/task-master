import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import cancellationRequestValidations from './cancellationRequest.validation';
import cancellationRequestController from './cancellationRequest.controller';

const router = express.Router();

router.post(
    '/create',
    auth(USER_ROLE.customer, USER_ROLE.provider),
    validateRequest(
        cancellationRequestValidations.createCancellationRequestZodSchema
    ),
    cancellationRequestController.createCancelRequest
);

export const cancellationRequestRoutes = router;
