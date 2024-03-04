import { Request, Response } from "express";
import Product from "../models/Products";
import { productById, productCreation } from "../validation/ProductsValidation";
import Category from "../models/Categories";
import Store from "../models/Stores";
import PatternResponses from "../utils/PatternResponses";
import { categoryCreation, categoryid } from "../validation/CategorValidation";
import { idValidation } from "../validation/globalValidation";

class CategoriesController {
    public static async parentCategoriesByStoreId(req: Request, res: Response){
        const {storeId} = req.params;

        const {error} = idValidation.validate(storeId)
        if (error) return res.status(400).json({ error: error.details[0].message });

        const categoryNames = await Category.findParentCategories(parseInt(storeId));
        if(!categoryNames) return PatternResponses.error.notFound(res, 'categoryNames')

        const names = categoryNames.map((el)=> {return el.name})

        return res.json(names)
    } 

    public static async createCategory(req: Request, res: Response){
        const category = req.body;

        const {error} = categoryCreation.validate(category)
        if (error) return res.status(400).json({ error: error.details[0].message });
    
        const categoryCreate = await Category.create(category);
        if(!categoryCreate) return PatternResponses.error.notCreated(res, 'category')
        
        return PatternResponses.success.created(res)
    }
}

export default CategoriesController