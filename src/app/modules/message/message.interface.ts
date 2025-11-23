import { ObjectId } from 'mongodb';

export interface IMessage {
    id: ObjectId;
    text: string;
    imageUrl: string[];
    videoUrl: string[];
    pdfUrl: string[];
    seen: boolean;
    msgByUserId: ObjectId;
    conversationId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
