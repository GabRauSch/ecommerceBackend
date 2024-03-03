import { Request, Response } from "express";
import Product from "../models/Products";
import { productById, productCreation } from "../validation/ProductsValidation";
import Category from "../models/Categories";
import Store from "../models/Stores";
import PatternResponses from "../utils/PatternResponses";
import { categoryid } from "../validation/CategorValidation";
import { idValidation } from "../validation/globalValidation";

class DiscountController {
    public static async discountById(req: Request, res: Response){
       const {discountId} = req.params;

       const {error} = idValidation.validate(discountId)
       if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

    } 

}

export default DiscountController