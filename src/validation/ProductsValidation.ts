import Joi from "joi";

export const productById = Joi.number().min(0).required();
export const discountValidation = Joi.number().min(0).max(100).required()

export const productCreation = Joi.object({
    name: Joi.string().min(5).max(20).required(),
    categoryId: Joi.number().min(0).required(),
    description: Joi.string().min(0).max(50).required(),
    storeId: Joi.number().min(0).required(),
    stockQuantity: Joi.number().min(0).required(),
    unitPrice: Joi.number().min(0).required(),
    discountId: Joi.number().min(0).required(),
    recommended: Joi.boolean().required(),
    createdAt: Joi.number().required()
})

export const applyDiscountValidation = Joi.object({
    
})
