import { Request, Response } from "express";

class ProductsController {
    public static productById(req: Request, res: Response){
        const {id} = req.params;


        return res.json({msg: 'mensga'})
    } 

    public static createProduct(req: Request, res: Response){
        const name = req.body.name;
        
        return res.json({
            name: name.toUpperCase()
            
        })
    }
}

export default ProductsController