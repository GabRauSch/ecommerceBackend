import { Router } from "express";
import ProductsController from '../controllers/ProductsController';
import DiscountController from "../controllers/DiscountController";

const router = Router();

router.get('/:id', DiscountController.discountById);

router.get('/name/:name', DiscountController.discountByName);

export default router