import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import promoUseServices from './promoUse.service';

const createPromoUse = catchAsync(async (req, res) => {
    const payload = req.body;
    const result = await promoUseServices.createPromoUseIntoDB(payload);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'PromoUse created successfully',
        data: result,
    });
});

const updatePromoUse = catchAsync(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await promoUseServices.updatePromoUseByIdFromDB(id, payload);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'PromoUse updated successfully',
        data: result,
    });
});

const getAllPromoUses = catchAsync(async (req, res) => {
    const result = await promoUseServices.getAllPromoUsesFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'PromoUses fetched successfully',
        data: result,
    });
});

const PromoUseController = {
    createPromoUse,
    updatePromoUse,
    getAllPromoUses,
};
export default PromoUseController;
