import Joi from "joi";

export const discountName = Joi.string().min(5).max(25).required();
