import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { notificationRoutes } from '../modules/notification/notification.routes';
import { userRoutes } from '../modules/user/user.routes';

import { categoryRoutes } from '../modules/category/category.routes';
import { superAdminRoutes } from '../modules/superAdmin/superAdmin.routes';

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
