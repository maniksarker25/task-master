import { model, Schema } from 'mongoose';
import { ISubscriber } from './subscriber.interface';

const subscriberSchema = new Schema<ISubscriber>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

const Subscriber = model<ISubscriber>('Subscriber', subscriberSchema);
export default Subscriber;
