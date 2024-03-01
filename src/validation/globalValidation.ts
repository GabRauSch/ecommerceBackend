import Joi from "joi"
export const idValidation = Joi.number().min(0).required()