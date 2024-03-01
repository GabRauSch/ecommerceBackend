import Joi from "joi"

export const categoryid = Joi.number().min(0).required()
export const categoryCreation = Joi.object({
    name: Joi.string().min(5).max(10).required(),
    parentCategoryId: Joi.number().min(0).required(),
    storeId: Joi.number().min(0).required()
})