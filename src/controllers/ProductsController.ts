import { Request, Response } from "express";
import Product from "../models/Product";
import { productById, productCreate } from "../validation/ProductsValidation";
import Category from "../models/Category";
import Store from "../models/Store";

class ProductsController {
    public static async productById(req: Request, res: Response){
        const {id} = req.params;

        const { error } = productById.validate(req.params)

        if (error) 
        {
            return res.status(400).json({ error: error.details[0].message });
        }
        const product = await Product.findByPk(id);
        if(product == null)
        {
            return res.status(404).json({error: "not found"})
        }

        return res.json(product)
    } 

    public static async createProduct(req: Request, res: Response){
        const {product} = req.body;


        const { error } = productCreate.validate(product)
        if (error) return res.status(400).json({ error: error.details[0].message });
        
        const category = await Category.findByPk(product.categoryId)
        const store = await Store.findByPk(product.storeId)


        if(category == null) return res.status(404).json({error: "category not found"});
        if(store == null) return res.status(404).json({error: "store not found"});
        if(category.storeId != product.storeId) return res.status(400).json({error: "the category doesn't belong to the store"}); 
        if (await Product.findByName(product.name)) return res.status(400).json({error: "name already exist"});

        const productCreation = await Product.createProduct(product);
        if(!productCreation) return res.status(400).json({error: "the product wasn't created"});
        
        return res.json({message: "created with success" })
    }
}

export default ProductsController