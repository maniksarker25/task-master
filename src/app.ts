/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';
import express, { Application } from 'express';
import sendContactUsEmail from './app/helper/sendContactUsEmail';

import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
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
            'https://taskalley-deploy-5lzv.vercel.app',
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

export function generateSignature(
    partnerId: string,
    apiKey: string,
    timestamp: string
) {
    const hmac = crypto.createHmac('sha256', apiKey);
    hmac.update(partnerId + timestamp);
    return hmac.digest('base64');
}

app.post('/api/v1/nin-verify', async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            middle_name,
            dob,
            gender,
            phone_number,
            id_number,
        } = req.body;

        const timestamp = new Date().toISOString();

        const signature = generateSignature(
            process.env.SMILE_PARTNER_ID!,
            process.env.SMILE_API_KEY!,
            timestamp
        );

        const payload = {
            callback_url: '',
            country: 'NG',
            dob,
            first_name,
            last_name,
            middle_name,
            gender,
            id_type: 'NIN',
            id_number,
            partner_id: process.env.SMILE_PARTNER_ID,
            partner_params: {
                job_id: 'job-' + Date.now(),
                user_id: 'user-' + Date.now(),
            },
            phone_number,
            signature,
            source_sdk: 'rest_api',
            source_sdk_version: '2.0.0',
            timestamp,
        };

        const response = await axios.post(
            `${process.env.SMILE_BASE_URL}/v2/verify`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        res.json(response.data);
    } catch (error: any) {
        console.log(error.response?.data || error.message);
        res.status(500).json(
            error.response?.data || { message: error.message }
        );
    }
});
// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
