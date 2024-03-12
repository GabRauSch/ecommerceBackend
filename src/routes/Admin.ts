import { Router } from "express";
import AdminController from '../controllers/AdminController';
import { privateRoute, roleSpecific } from "../config/passport";

const router = Router();

router.get('/overview/:storeId', AdminController.overview);
router.get('/products/analyticInfo/:storeId', AdminController.analyticProductInfo)
router.get('/clients/analyticInfo/:storeId', AdminController.analyticClientInfo)
router.get('/sales/overView/:storeId', AdminController.salesOverView)
router.get('/sales/:storeId', AdminController.analyticSales)
router.get('/clients/overView/:storeId', AdminController.clientsOverView)
router.get('/clients/:storeId', AdminController.analyticClients)
router.get('/products/allInfo/:storeId', AdminController.productsAllinfo)
router.get('/warehouse/:storeId', AdminController.wareHouse)

export default router