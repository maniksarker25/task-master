/* eslint-disable @typescript-eslint/ban-ts-comment */

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
