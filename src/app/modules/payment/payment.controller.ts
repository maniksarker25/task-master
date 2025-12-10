import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import paymentServices from './payment.service';

const getAllPayments = catchAsync(async (req, res) => {
    const result = await paymentServices.getAllPayments(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Payments retrieved successfully',
        data: result,
    });
});

const PaymentController = { getAllPayments };
export default PaymentController;
