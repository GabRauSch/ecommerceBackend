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

        const categories = await Category.findParentCategories(parseInt(storeId));
        if(!categories) return PatternResponses.error.notFound(res, 'category')

        return res.json(categories)
    } 

    public static async createCategory(req: Request, res: Response){
        const category = req.body;

        const {error} = categoryCreation.validate(category)
        if (error) return res.status(400).json({ error: error.details[0].message });
    
        const categoryCreate = await Category.create(category);
        if(!categoryCreate) return PatternResponses.error.notCreated(res, 'category')
        
        return PatternResponses.success.created(res)
    }

    public static async productsAndChilds(req: Request, res: Response){
        const {categoryId} = req.params;
        
        const {error} = categoryid.validate(categoryId)
        if (error) return res.status(400).json({ error: error.details[0].message });

        const products = await Product.findByCategoryAndChildren(parseInt(categoryId))
        return res.json(products)
    }
}

export default CategoriesController