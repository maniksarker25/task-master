/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import httpStatus from 'http-status';
// import twilio from 'twilio';
// import config from '../config';
// import AppError from '../error/appError';

// const client = twilio(config.twilio.accountSid, config.twilio.authToken);
// const sendSMS = async (to: string, message: string) => {
//     try {
//         await client.messages.create({
//             body: message,
//             from: 'whatsapp:+14155238886',
//             to: 'whatsapp:' + to,
//         });

//         return {
//             invalid: false,
//             message: `Message sent successfully to ${to}`,
//         };
//     } catch (error) {
//         console.error('Error sending SMS:', error);

//         throw new AppError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             'Failed to send sms'
//         );
//     }
// };

// export default sendSMS;
// @ts-ignore
import moceansdk from 'mocean-sdk';

const mocean = new moceansdk.Mocean(
    new moceansdk.Client({
        apiToken: process.env.MOCEAN_API_TOKEN!,
    })
);

export interface SmsResponse {
    messages: {
        status: number;
        receiver?: string;
        msgid?: string;
        err_msg?: string;
    }[];
}

export const sendSMS = async (
    phoneNumber: string,
    smsMessage: string
): Promise<SmsResponse> => {
    try {
        const response: SmsResponse = await mocean.sms().send({
            'mocean-from': '12345',
            'mocean-to': phoneNumber,
            // 'mocean-text': smsMessage,
            'mocean-text': 'Hello, this is a test.',
        });

        console.log('✅ SMS sent successfully:', response);
        return response;
    } catch (error: any) {
        console.error('❌ Failed to send SMS:', error.message || error);
        throw new Error('Failed to send SMS');
    }
};
