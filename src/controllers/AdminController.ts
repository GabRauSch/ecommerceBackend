import { Request, Response } from "express";
import Product from "../models/Products";
import { productById, productCreate } from "../validation/ProductsValidation";
import Category from "../models/Categories";
import Store from "../models/Stores";
import PatternResponses from "../utils/PatternResponses";

class AdminController {
   static async companyInfo(req: Request, res: Response){
    res.json({message: 'company info'})
   }
}

export default AdminController