import { Router } from "express";
import ProductsController from '../controllers/ProductsController';
import CategoriesController from "../controllers/CategoriesController";

const router = Router();

router.get('/:storeId', CategoriesController.parentCategoriesByStoreId);

export default router