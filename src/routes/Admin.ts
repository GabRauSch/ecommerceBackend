import { Router } from "express";
import AdminController from '../controllers/AdminController';
import { privateRoute, roleSpecific } from "../config/passport";

const router = Router();

router.get('/overview/:storeId', AdminController.overview);

export default router