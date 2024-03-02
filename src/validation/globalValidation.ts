import Joi from "joi"
export const idValidation = Joi.number().min(0).required()

export const datValidation = Joi.date().required()

export const greaterDate = Joi.date().greater('now')