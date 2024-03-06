import { Router } from "express";
import ProductsController from '../controllers/ProductsController';
import DiscountController from "../controllers/DiscountController";
import PurchaseController from "../controllers/PurchaseController";

const router = Router();

router.post('/', PurchaseController.purchaseItem);

export default router