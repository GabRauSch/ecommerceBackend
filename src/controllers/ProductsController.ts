import { Request, Response } from "express";
import Product from "../models/Product";
import { productById, productCreate } from "../validation/ProductsValidation";
import Category from "../models/Category";
import Store from "../models/Store";
import PatternResponses from "../utils/PatternResponses";

class ProductsController {
    public static async productById(req: Request, res: Response){
        const {id} = req.params;

        const {error} = productById.validate(req.params)
        if (error) return res.status(400).json({ error: error.details[0].message });

        const product = await Product.findByPk(id);
        if(!product) return res.status(404).json({error: "not found"})

        return res.json(product)
    } 

    public static async createProduct(req: Request, res: Response){
        const {product} = req.body;


        const {error} = productCreate.validate(product)
        if (error) return res.status(400).json({ error: error.details[0].message });
        
        const [category, store] = await Promise.all([
            Category.findByPk(product.categoryId),
            Store.findByPk(product.storeId)
        ]);
        if(!category) return PatternResponses.error.notFound(res, 'category')
        if(!store) return PatternResponses.error.notFound(res, 'store')
        if(category.storeId != product.storeId) return PatternResponses.error.doesntBelong(res, 'category', 'store')
        if (await Product.findByName(product.name)) return PatternResponses.error.alreadyExists(res, 'product name');

        const productCreation = await Product.createProduct(product);
        if(!productCreation) return res.status(400).json({error: "The product hasn't been created"});
        
        return res.json({message: "Created with success" })
    }
}

export default ProductsController