import { Request, Response } from "express";
import Product from "../models/Products";
import { discountValidation, productById, productCreation } from "../validation/ProductsValidation";
import Category from "../models/Categories";
import Store from "../models/Stores";
import PatternResponses from "../utils/PatternResponses";
import { greaterDate, idValidation } from "../validation/globalValidation";

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

    public static async applySingleDiscount(req: Request, res: Response){
        const {productId, discount, discountFinishTime} = req.body;

        const {error} = idValidation.validate(productId) || greaterDate.validate(discountFinishTime);
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

        const product = await Product.findByPk(productId);
        if(!product) return PatternResponses.error.noRegister(res)

        const discountUpdate = await Product.applySingleDiscount(product, discount, discountFinishTime);
        if(!discountUpdate) return PatternResponses.error.notUpdated(res);

        return PatternResponses.success.updated(res)
    }
    
    public static async applyDiscountsToCategory(req: Request, res: Response){
        const {categoryId, discount, discountFinishTime} = req.body;

        const {error} = idValidation.validate(categoryId) || greaterDate.validate(discountFinishTime) || discountValidation.validate(discount);
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);
        
        const products = await Product.findAll({where: {categoryId}, attributes:['id']});
        if(!products) return PatternResponses.error.noRegister(res)
        
        const productIds = products.map(product => product.id)
        const discountUpdate = await Product.applyBatchDiscount(productIds, discount, discountFinishTime)
        if(!discountUpdate) return  PatternResponses.error.notUpdated(res)

        return PatternResponses.success.updated(res)
    }

    public static async applyDiscountsToCategoryAndChild(req: Request, res: Response){
        const {categoryId, discount, discountFinishTime} = req.body;

        const {error} = idValidation.validate(categoryId) || greaterDate.validate(discountFinishTime) || discountValidation.validate(discount);
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);
        
        const products = await Product.findByCategoryAndChildren(categoryId, ['id']);
        if(!products) return PatternResponses.error.noRegister(res)

        const productIds = products?.map(product => product.id)
        const discountUpdate = await Product.applyBatchDiscount(productIds, discount, discountFinishTime)
        if(!discountUpdate) return  PatternResponses.error.notUpdated(res)

        return PatternResponses.success.updated(res)
    }

    public static async removeProduct(req: Request, res: Response){
        const {productId} = req.body;

        const {error} = idValidation.validate(productId)
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

        const product = await Product.findByPk(productId);
        if(!product) return PatternResponses.error.noRegister(res)

        try {
            const productRemove = await product.destroy();
        } catch (error) {
            return PatternResponses.error.notDeleted(res)
        }
        
        return PatternResponses.success.deleted(res)
    }
}

export default ProductsController