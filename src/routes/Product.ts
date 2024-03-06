import { Router } from "express";
import ProductsController from '../controllers/ProductsController';
import { upload } from "../config/multer";

const router = Router();

router.get('/:id', ProductsController.productById);
router.get('/all/:storeId', ProductsController.productByStoreId);
router.get('/all/category/:categoryId', ProductsController.productsByCategory);
router.get('/all/childs/:categoryId', ProductsController.productsAndChilds);
router.get('/all/mostPurchased/:storeId', ProductsController.mostPurchasedItems);
router.get('/all/mostPurchased/category/:storeId', ProductsController.mostPurchasedInCategories);
router.get('/discount/ending/:storeId', ProductsController.productByEndingDiscount)

router.post('/create', upload.single('image'), ProductsController.createProduct)

router.put('/discount', ProductsController.applySingleDiscount)
router.put('/discount/batch', ProductsController.applyDiscountsToCategory)
router.put('/discount/batch/childs', ProductsController.applyDiscountsToCategoryAndChild)

router.delete('/:productId', ProductsController.removeProduct)

export default router