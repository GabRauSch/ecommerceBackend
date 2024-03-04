import { Router } from "express";
import ProductsController from '../controllers/ProductsController';
import CategoriesController from "../controllers/CategoriesController";
import { categoryCreation } from "../validation/CategorValidation";

const router = Router();

router.get('/:storeId', CategoriesController.parentCategoriesByStoreId);

router.post('/', CategoriesController.createCategory);


export default router