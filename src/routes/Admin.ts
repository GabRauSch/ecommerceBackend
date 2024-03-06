import { Router } from "express";
import AdminController from '../controllers/AdminController';
import { privateRoute, roleSpecific } from "../config/passport";

const router = Router();

router.get('/overview/:storeId', AdminController.overview);
router.get('/products/analyticInfo/:storeId', AdminController.analyticProductInfo)
router.get('/clients/analyticInfo/:storeId', AdminController.analyticClientInfo)
router.get('/purchase/analyticInfo/:storeId', AdminController.analyticPurchaseInfo)

export default router