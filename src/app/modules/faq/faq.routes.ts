import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import faqValidations from './faq.validation';
import faqController from './faq.controller';

const router = express.Router();

router.post(
    '/create',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    validateRequest(faqValidations.createFaq),
    faqController.createFaq
);

router.get('/all-faq', faqController.getAllFaq);

router.patch(
    '/update/:id',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    validateRequest(faqValidations.updateFaq),
    faqController.updateFaq
);

router.delete(
    '/delete/:id',
    auth(USER_ROLE.admin, USER_ROLE.superAdmin),
    faqController.deleteFaq
);

export const faqRoutes = router;
