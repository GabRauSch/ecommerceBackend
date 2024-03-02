import Joi from "joi";

export const storeCreation = Joi.object({
    name: Joi.string().min(2).max(20).required(),
    ownerId: Joi.number().min(0).required(),
    location: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required()
    })
})
