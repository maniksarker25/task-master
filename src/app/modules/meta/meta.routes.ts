import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import MetaController from './meta.controller';

const router = express.Router();

router.get(
  '/get-dashboard-meta-data',
  auth(USER_ROLE.superAdmin),
  MetaController.getDashboardMetaData,
);

router.get(
  '/user-chart-data',
  auth(USER_ROLE.superAdmin),
  MetaController.getUserChartData,
);
router.get(
  '/subscription-chart-data',
  auth(USER_ROLE.superAdmin),
  MetaController.getSubscriptionChartData,
);

export const metaRoutes = router;
