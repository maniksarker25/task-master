import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { notificationRoutes } from '../modules/notification/notification.routes';
import { userRoutes } from '../modules/user/user.routes';

import { categoryRoutes } from '../modules/category/category.routes';
import { subscriberRoutes } from '../modules/subscriber/subscriber.routes';
import { superAdminRoutes } from '../modules/superAdmin/superAdmin.routes';
import { taskRoutes } from '../modules/task/task.routes';
import { bidRoutes } from '../modules/bid/bid.routes';
import { promoRoutes } from '../modules/promo/promo.routes';
import { promoUseRoutes } from '../modules/promoUse/promoUse.routes';
import { providerRoutes } from '../modules/provider/provider.routes';
import { serviceRoutes } from '../modules/service/service.routes';

const router = Router();

const moduleRoutes = [
    {
        path: '/auth',
        router: authRoutes,
    },
    {
        path: '/user',
        router: userRoutes,
    },

    {
        path: '/manage',
        router: ManageRoutes,
    },
    {
        path: '/task',
        router: taskRoutes,
    },
    {
        path: '/bid',
        router: bidRoutes,
    },
    {
        path: '/promo',
        router: promoRoutes,
    },
    {
        path: '/promo-use',
        router: promoUseRoutes,
    },
    {
        path: '/provider',
        router: providerRoutes,
    },
    {
        path: '/notification',
        router: notificationRoutes,
    },

    {
        path: '/category',
        router: categoryRoutes,
    },
    {
        path: '/super-admin',
        router: superAdminRoutes,
    },
    {
        path: '/subscriber',
        router: subscriberRoutes,
    },
    {
        path: '/service',
        router: serviceRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
