import { Request, Response } from "express";
import Product from "../models/Products";
import { productById, productCreation } from "../validation/ProductsValidation";
import Category from "../models/Categories";
import Store from "../models/Stores";
import PatternResponses from "../utils/PatternResponses";
import { categoryid } from "../validation/CategorValidation";
import { idValidation } from "../validation/globalValidation";

class ProductsController {
    public static async productById(req: Request, res: Response){
        const {id} = req.params;

        const {error} = idValidation.validate(id)
        if (error) return res.status(400).json({ error: error.details[0].message });

        const product = await Product.findByPk(id);
        if(!product) return res.status(404).json({error: "not found"})

        return res.json(product)
    } 

    public static async createProduct(req: Request, res: Response){
        const product = req.body;

        const {error} = productCreation.validate(product)
        if (error) return res.status(400).json({ error: error.details[0].message });
        
        const [category, store] = await Promise.all([
            Category.findByPk(product.categoryId),
            Store.findByPk(product.storeId)
        ]);
        if(!category) return PatternResponses.error.notFound(res, 'category')
        if(!store) return PatternResponses.error.notFound(res, 'store')
        if(category.storeId != product.storeId) return PatternResponses.error.doesntBelong(res, 'category', 'store')
        if (await Product.findByName(product.name)) return PatternResponses.error.alreadyExists(res, 'product name');

        const productCreate = await Product.create(product);
        if(!productCreate) return res.status(400).json({error: "The product hasn't been created"});
        
        return PatternResponses.success.created(res,)
    }

    public static async productsAndChilds(req: Request, res: Response){
        const {categoryId} = req.params;
        
        const {error} = idValidation.validate(categoryId)
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

        const products = await Product.findByCategoryAndChildren(parseInt(categoryId))
        return res.json(products)
    }
}

export default ProductsController