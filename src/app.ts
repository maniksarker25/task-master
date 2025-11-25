/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import sendContactUsEmail from './app/helper/sendContactUsEmail';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import smileIdClient from './app/utilities/smileIdClient';
const app: Application = express();
// parser----------------
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: [
            'http://localhost:3007',
            'http://localhost:3008',
            'http://localhost:3000',
            'https://taskalley-deploy.vercel.app',
            'https://taskalley-landing-page.vercel.app',
            'https://taskalley.com',
            'https://www.taskalley.com',
            'http://localhost:3001',
            'http://10.10.20.48:3000',
        ],
        credentials: true,
    })
);
app.use('/uploads', express.static('uploads'));
// application routers ----------------
app.use('/api/v1', router);
app.post('/contact-us', sendContactUsEmail);

app.get('/', async (req, res) => {
    res.send({ message: 'nice to meet you 2' });
});

router.post('/verify', async (req: any, res: any) => {
    try {
        const { id_type, id_number, dob, user_id, job_id } = req.body;

        if (!id_type || !id_number || !user_id || !job_id) {
            return res
                .status(400)
                .json({ message: 'Missing required parameters' });
        }

        const idInfo = { id_type, id_number, dob };
        const partnerParams = {
            user_id,
            job_id,
            job_type: 'BASIC_KYC' as const,
        };

        const result = await smileIdClient.verifyId(idInfo, partnerParams);
        res.send(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
