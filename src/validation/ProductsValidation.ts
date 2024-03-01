import Joi from "joi";

export const productById = Joi.object({
    id: Joi.number().min(0).required()
})
export const productCreate = Joi.object
({
    name: Joi.string().min(5).max(20).required(),
    categoryId: Joi.number().min(0).required(),
    description: Joi.string().min(0).max(50).required(),
    storeId: Joi.number().min(0).required(),
    stockQuantity: Joi.number().min(0).required(),
    unitPrice: Joi.number().min(0).required(),
    discount: Joi.number().min(0).max(100).required(),
    discountFinishTime: Joi.number().required(),
    recommended: Joi.boolean().required(),
    createdAt: Joi.number().required()
})