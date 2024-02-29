import Joi from "joi";

export const productById = Joi.object({
    id: Joi.number().min(0).required()
})