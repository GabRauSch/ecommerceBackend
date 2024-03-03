import Joi from "joi";

export const purchaseValidation = Joi.object({
    productId: Joi.number().min(0).integer().required(),
    quantity: Joi.number().min(0).integer()
})