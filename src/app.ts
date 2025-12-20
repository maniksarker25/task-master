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
            'https://windows-upgrade-dashboard.vercel.app',
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

function getSmileTimestamp() {
    const date = new Date();

    const yyyy = date.getUTCFullYear();
    const MM = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const HH = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    const fff = String(date.getUTCMilliseconds()).padStart(3, '0');

    return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${fff}+0000`;
}

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
        const timestamp = new Date().toISOString();
        const api_key = process.env.SMILE_API_KEY as string;
        const partner_id = process.env.SMILE_PARTNER_ID as string;
        const hmac = crypto.createHmac('sha256', api_key);

        hmac.update(timestamp, 'utf8');
        hmac.update(partner_id, 'utf8');
        hmac.update('sid_request', 'utf8');

        let signature = hmac.digest().toString('base64');

        const payload = {
            first_name: 'Test',
            last_name: 'User',
            dob: '1990-01-01',
            country: 'NG',
            id_number: '00000000004',
            // id_type: 'NIN_V2',
            id_type: 'DRIVERS_LICENSE_V2',
            partner_id: process.env.SMILE_PARTNER_ID,
            partner_params: {
                job_id: '985c594e-7e67-4f2e-a6e0-3be127dbb6a0',
                job_type: 5,
                user_id: '887ceeea-e9fd-4f96-aa58-d4b12d0b5f98',
                sandbox_result: '0',
            },
            signature: signature,
            timestamp: timestamp,
        };

        const response = await axios.post(
            `${process.env.SMILE_BASE_URL}/v2/verify`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('response', response);

        res.json(response.data);
    } catch (error: any) {
        console.log(error.response?.data || error.message);
        res.status(500).json(
            error.response?.data || { message: error.message }
        );
    }
});
// app.post('/api/v1/nin-verify', async (req, res) => {
//     try {
//         // const timestamp = getSmileTimestamp();
//         let timestamp = new Date().toISOString();
//         let api_key = process.env.SMILE_API_KEY as string;
//         let partner_id = process.env.SMILE_PARTNER_ID as string;
//         let hmac = crypto.createHmac('sha256', api_key);

//         hmac.update(timestamp, 'utf8');
//         hmac.update(partner_id, 'utf8');
//         hmac.update('sid_request', 'utf8');

//         let signature = hmac.digest().toString('base64');
//         // const signature = generateSignature(
//         //     process.env.SMILE_PARTNER_ID!,
//         //     process.env.SMILE_API_KEY!,
//         //     timestamp
//         // );

//         // const payload = {
//         //     callback_url: '',
//         //     country: 'NG',
//         //     dob: '2000-09-20',
//         //     first_name: 'Joe',
//         //     last_name: 'Leo',
//         //     middle_name: 'Doe',
//         //     gender: 'M',
//         //     id_type: 'NIN',
//         //     id_number: '12345678901',
//         //     partner_id: process.env.SMILE_PARTNER_ID,
//         //     partner_params: {
//         //         job_id: `job-${Date.now()}`,
//         //         user_id: `user-${Date.now()}`,
//         //     },
//         //     phone_number: '0123456789',
//         //     signature,
//         //     source_sdk: 'rest_api',
//         //     source_sdk_version: '2.0.0',
//         //     timestamp,
//         // };

//         const payload = {
//             first_name: 'Test',
//             last_name: 'User',
//             dob: '1990-01-01',
//             country: 'NG',
//             id_number: '00000000004',
//             id_type: 'NIN_V2',
//             partner_id: process.env.SMILE_PARTNER_ID,
//             partner_params: {
//                 job_id: '985c594e-7e67-4f2e-a6e0-3be127dbb6a0',
//                 job_type: 5,
//                 user_id: '887ceeea-e9fd-4f96-aa58-d4b12d0b5f98',
//                 sandbox_result: '0',
//             },
//             signature: signature,
//             timestamp: timestamp,
//         };

//         const response = await axios.post(
//             `${process.env.SMILE_BASE_URL}/v2/verify`,
//             payload,
//             { headers: { 'Content-Type': 'application/json' } }
//         );

//         res.json(response.data);
//     } catch (error: any) {
//         console.log(error.response?.data || error.message);
//         res.status(500).json(
//             error.response?.data || { message: error.message }
//         );
//     }
// });
// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
