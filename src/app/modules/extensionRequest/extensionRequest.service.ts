import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IExtensionRequest } from './extensionRequest.interface';
import extensionRequestModel from './extensionRequest.model';
import TaskModel from '../task/task.model';

const extensionRequestIntoDb = async (
    profileId: string,
    payload: Partial<IExtensionRequest>
) => {
    let currentUserRole: 'Customer' | 'Provider' | '' = '';
    const task = await TaskModel.findById(payload.task);
    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }

    if (profileId == task.provider?.toString()) {
        currentUserRole = 'Provider';
    } else if (profileId == task.customer?.toString()) {
        currentUserRole = 'Customer';
    }

    if (currentUserRole === '') {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'You are not authorized to request extension for this task'
        );
    }
    const extensionRequestData: Partial<IExtensionRequest> = {
        task: payload.task,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requestedBy: profileId as any,
        requestedByModel: currentUserRole,
        currentDate: task.preferredDate,
        requestedDate: payload.requestedDate,
        requestedAt: payload.requestedAt,
        reason: payload.reason,
    };
    const result = (
        await extensionRequestModel.create(extensionRequestData)
    ).populate('requestedBy');
    return result;
};

const ExtensionRequestServices = { extensionRequestIntoDb };
export default ExtensionRequestServices;
