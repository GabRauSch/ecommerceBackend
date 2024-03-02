import { cpf } from "cpf-cnpj-validator";
import Joi from "joi";

const cpfValidation = (value: string) => {
    if (!cpf.isValid(value)) {
        throw new Error('Invalid CPF number');
    }
    return value;
};

export const staffMemberValidation = Joi.object({
    name: Joi.string().min(5).required(),
    email: Joi.string().email().required(),
    cpf: Joi.string().custom(cpfValidation, 'CPF Validation').required(),
    location: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required()
    }).required(),
    password: Joi.string().min(5).required(),
    birthday: Joi.string().isoDate().required(),
    role: Joi.string().valid('admin', 'staff', 'local-admin').required(),
    storeId: Joi.number().min(0).required(),
});
