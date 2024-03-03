import { Router } from "express";
import ProductsController from '../controllers/ProductsController';

const router = Router();

router.get('/:id', ProductsController.productById);
router.get('/all/:storeId', ProductsController.productByStoreId);
router.get('/all/:categoryId', ProductsController.productsByCategory);
router.get('/all/childs/:categoryId', ProductsController.productsAndChilds);
router.get('/all/mostPurchased', ProductsController.mostPurchasedItems);

router.post('/create', ProductsController.createProduct)

router.put('/discount', ProductsController.applySingleDiscount)
router.put('/discount/batch', ProductsController.applyDiscountsToCategory)
router.put('/discount/batch/childs', ProductsController.applyDiscountsToCategoryAndChild)

export default router