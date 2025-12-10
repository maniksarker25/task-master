import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import paymentController from './payment.controller';

const router = express.Router();

router.get(
    '/get-all',
    auth(USER_ROLE.superAdmin, USER_ROLE.admin),
    paymentController.getAllPayments
);

export const paymentRoutes = router;
