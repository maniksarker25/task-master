import { model, Schema } from "mongoose";
import { IFile-upload } from "./file-upload.interface";

const file-uploadSchema = new Schema<IFile-upload>({
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    address: { type: String },
    profile_image: { type: String, default: "" },
    totalAmount: { type: Number, default: 0 },
    totalPoint: { type: Number, default: 0 }
}, { timestamps: true });

const file-uploadModel = model<IFile-upload>("File-upload", file-uploadSchema);
export default file-uploadModel;