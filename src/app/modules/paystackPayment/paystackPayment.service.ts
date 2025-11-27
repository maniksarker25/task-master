/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../error/appError';
import { sendSinglePushNotification } from '../../helper/sendPushNotification';
import {
    ENUM_PAYMENT_PURPOSE,
    ENUM_PAYMENT_STATUS,
} from '../../utilities/enum';
import BidModel from '../bid/bid.model';
import { ENUM_NOTIFICATION_TYPE } from '../notification/notification.enum';
import Notification from '../notification/notification.model';
import { ENUM_TASK_STATUS } from '../task/task.enum';
import TaskModel from '../task/task.model';
// handle pay-stack webhook
const handlePaystackWebhook = async (req: any) => {
    console.log('Handling Pay-stack webhook...');
    try {
        const hash = crypto
            .createHmac('sha512', config.payStack.secretKey as string)
            .update(JSON.stringify(req.body))
            .digest('hex');
        if (hash == req.headers['x-paystack-signature']) {
            // Retrieve the request's body
            const event = req.body;
            console.log('Pay-stack Webhook Event:', event);
            // Handle the event
            switch (event.event) {
                case 'charge.success':
                    console.log('Charge was successful:', event.data);
                    // Then define and call a method to handle the successful charge.
                    if (
                        event.data.metadata &&
                        event.data.metadata.paymentPurpose ===
                            ENUM_PAYMENT_PURPOSE.BID_ACCEPT
                    ) {
                        return await handleBidAcceptPayment(
                            event.data.metadata
                        );
                    }
                    break;
                case 'charge.failed':
                    console.log('Charge failed:', event.data);
                    // Then define and call a method to handle the failed charge.
                    break;
                // ... handle other event types
                default:
                    console.log(`Unhandled event type ${event.event}`);
            }
        }
    } catch (error) {
        console.error('Error handling Pay-stack webhook:', error);
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Webhook handling failed'
        );
    }
};

const handleBidAcceptPayment = async (metaData: any) => {
    const task = await TaskModel.findById(metaData.taskId);
    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }
    const bid: any = await BidModel.findById(metaData.bidId).populate({
        path: 'provider',
        populate: { path: 'user' },
    });
    if (!bid) {
        throw new AppError(httpStatus.NOT_FOUND, 'Bid not found');
    }
    await TaskModel.findByIdAndUpdate(
        task._id,
        {
            $set: {
                provider: bid.provider,
                status: ENUM_TASK_STATUS.IN_PROGRESS,
                paymentStatus: ENUM_PAYMENT_STATUS.PAID,
            },
            statusWithDate: [
                { status: ENUM_TASK_STATUS.OFFERED, date: bid.createdAt },
                { status: ENUM_TASK_STATUS.IN_PROGRESS, date: Date.now() },
            ],
        },
        { new: true }
    );

    const taskTitle = task?.title || 'Your task';

    await Notification.create({
        title: 'Task Accepted',
        message: `Your bid has been accepted for task "${taskTitle}"`,
        receiver: bid.provider._id.toString(),
        type: ENUM_NOTIFICATION_TYPE.TASK_ACCEPTED,
        redirectLink: `${bid?.task}`,
    });

    if (bid.provider.user) {
        await sendSinglePushNotification(
            bid.provider.user._id.toString(),
            'Task Accepted',
            `Your bid has been accepted for task "${taskTitle}"`,
            {
                taskId: bid.task.toString(),
                type: ENUM_NOTIFICATION_TYPE.TASK_ACCEPTED,
            }
        );
    }
};

const PaystackPaymentService = {
    handlePaystackWebhook,
};
export default PaystackPaymentService;
