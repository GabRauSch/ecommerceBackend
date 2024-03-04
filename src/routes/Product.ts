import { Router } from "express";
import ProductsController from '../controllers/ProductsController';

const router = Router();

router.get('/:id', ProductsController.productById);
router.get('/all/:storeId', ProductsController.productByStoreId);
router.get('/all/category/:categoryId', ProductsController.productsByCategory);
router.get('/all/childs/:categoryId', ProductsController.productsAndChilds);
router.get('/all/mostPurchased/items/:storeId', ProductsController.mostPurchasedItems);
router.get('/all/mostPurshased/category/:storeId', ProductsController.mostPurchasedInCategories);
router.get('/discount/:storeId', ProductsController.productByEndingDiscount)

router.post('/create', ProductsController.createProduct)

router.put('/discount', ProductsController.applySingleDiscount)
router.put('/discount/batch', ProductsController.applyDiscountsToCategory)
router.put('/discount/batch/childs', ProductsController.applyDiscountsToCategoryAndChild)

router.delete('/:productId', ProductsController.removeProduct)

export default router