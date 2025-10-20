import { z } from "zod";

export const updatePaymentData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const PaymentValidations = { updatePaymentData };
export default PaymentValidations;