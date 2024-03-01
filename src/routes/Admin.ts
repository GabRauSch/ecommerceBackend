import { Router } from "express";
import AdminController from '../controllers/AdminController';
import { privateRoute, roleSpecific } from "../config/passport";

const router = Router();

router.get('/:id', privateRoute, roleSpecific('admin'), AdminController.companyInfo);

export default router