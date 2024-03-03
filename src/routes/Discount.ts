import { Router } from "express";
import ProductsController from '../controllers/ProductsController';
import DiscountController from "../controllers/DiscountController";

const router = Router();

router.get('/:id', DiscountController.discountById);

export default router