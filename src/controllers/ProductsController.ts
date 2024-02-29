import { Request, Response } from "express";
import Product from "../models/Product";
import { productById } from "../validation/ProductsValidation";

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

    public static createProduct(req: Request, res: Response){
        const {name} = req.body;
        
        return res.json({
            name: name.toUpperCase()
            
        })
    }
}

export default ProductsController