import Joi from "joi";

export const createReviewValidation = Joi.object({
    userId: Joi.number().min(0).required(),
    productId:Joi.number().min(0).required(),
    rating: Joi.number().min(0).max(5).required(),
    comment: Joi.string(),
    })