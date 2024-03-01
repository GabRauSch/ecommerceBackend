import { Router } from "express";
import ProductsController from '../controllers/ProductsController';

const router = Router();

router.get('/:id', ProductsController.productById);
router.get('/all/:storeId');
router.get('/all/:categoryId');
router.get('/all/childs/:categoryId', ProductsController.productsAndChilds);
router.get('/all/mostPurchased');

router.post('/create', ProductsController.createProduct)

export default router