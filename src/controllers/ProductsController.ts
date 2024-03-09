import { NextFunction, Request, Response } from "express";
import Product from "../models/Products";
import { applyDiscountValidation, discountValidation, productById, productCreation } from "../validation/ProductsValidation";
import Category from "../models/Categories";
import Store from "../models/Stores";
import PatternResponses from "../utils/PatternResponses";
import { greaterDate, idValidation } from "../validation/globalValidation";
import { Selections } from "../types/products/Selection";
import { removeFile, setFileName, uploadFile } from "../utils/Files";
import path from 'path';

class ProductsController {
    public static async productById(req: Request, res: Response){
        const {id} = req.params;

        const {error} = idValidation.validate(id)
        if (error) return res.status(400).json({ error: error.details[0].message });

        const product = await Product.findProduct(parseInt(id));
        if(!product) return PatternResponses.error.notFound(res, 'product')

        return res.json(product)
    } 

    public static async createProduct(req: Request, res: Response){
        const product = req.body;
        const file = req.file;

        if(!file) return PatternResponses.error.missingAttributes(res, 'Image');
        const {error} = productCreation.validate(product)
        if (error){
            removeFile(file.path)
            return res.status(400).json({ error: error.details[0].message });
        } 
        const [category, store] = await Promise.all([
            Category.findByPk(product.categoryId),
            Store.findByPk(product.storeId)
        ]);
        if(!category){
            removeFile(file.path)
            return PatternResponses.error.notFound(res, 'category')
        }
        if(!store){
            removeFile(file.path)
            return PatternResponses.error.notFound(res, 'store')
        }
        if(category.storeId != product.storeId) {
            removeFile(file.path);
            return PatternResponses.error.doesntBelong(res, 'category', 'store')
        }
        if (await Product.findOne({where: {name: product.name, storeId: product.storeId}})) {
            removeFile(file.path);
            return PatternResponses.error.alreadyExists(res, 'product name for this store');
        }

        const image = setFileName();
        await uploadFile(file, image);

        const productCreate = await Product.create({...product, image});
        if(!productCreate) {
            const filePath = path.join(__dirname, '../../public/images', image)
            removeFile(filePath)
            return PatternResponses.error.notCreated(res, 'product')
        };
        
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
        const {productId, discountId} = req.body;
        
        const {error} = applyDiscountValidation.validate(req.body);
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

        const product = await Product.findByPk(productId,{attributes:['id']});
        if(!product) return PatternResponses.error.noRegister(res)

        const discountUpdate = await Product.applySingleDiscount(productId, discountId);
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

    public static async productsByStoreId(req: Request, res: Response){
        const {storeId} = req.params;

        const {error} = idValidation.validate(storeId)
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

        const products = await Product.findAll({where: {storeId}})
        if(!products) return PatternResponses.error.noRegister(res);

        return res.json(products)
    }

    public static async productsByCategory(req: Request, res: Response){
        const {categoryId} = req.params;
        const {rm} = req.query
        const {error} = idValidation.validate(categoryId)
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

        const removeIds = (rm && typeof rm === 'string') ? parseInt(rm) : undefined

        const products = await Product.findByCategory(parseInt(categoryId), removeIds);
        if(!products) return PatternResponses.error.noRegister(res);

        return res.json(products)
    }

    public static async productByEndingDiscount(req: Request, res: Response){
        const {storeId} = req.params;

        const {error} = idValidation.validate(storeId);
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

        const products = await Product.findByEndingDiscount(parseInt(storeId));
        if(!products) return PatternResponses.error.notFound(res, 'products');
        const data = {
            products
        }
        return res.json(products)
    }

    public static async mostPurchasedItems(req: Request, res: Response){
        const {storeId} = req.params;
        
        const {error} = idValidation.validate(storeId);
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

        const products = await Product.findMostPurchasedItems(parseInt(storeId))

        return res.json(products)
    }

    public static async mostPurchasedInCategories(req: Request, res: Response){
        const {storeId} = req.params;

        const {error} = idValidation.validate(storeId)
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

        const products = await Product.findMostPurchasedItemByCategories(parseInt(storeId))

        return res.json(products)
    }

}

export default ProductsController