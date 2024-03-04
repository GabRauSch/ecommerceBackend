import { Request, Response } from "express";
import PatternResponses from "../utils/PatternResponses";
import { idValidation } from "../validation/globalValidation";
import Discount from "../models/Discounts";
import { discountName } from "../validation/DiscountValidation";

class DiscountController {
    public static async discountById(req: Request, res: Response){
       const {id} = req.params;

       const {error} = idValidation.validate(id)
       if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

       const discount = await Discount.findByPk(id)
       if (!discount) return PatternResponses.error.notFound(res, 'discount')

       return res.json(discount)
    } 

    public static async discountByName(req: Request, res: Response)
    {
        const {name} = req.params;

        const {error} = discountName.validate(name)
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

        const discount = await Discount.findByName(name)
        if (!discount) return PatternResponses.error.notFound(res, 'discount')

        return res.json(discount)
    } 
}


export default DiscountController