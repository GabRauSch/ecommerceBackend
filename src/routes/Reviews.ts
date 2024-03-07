import { Router } from "express";
import ReviewController from "../controllers/ReviewController";

const router = Router();

router.post('/', ReviewController.createReview);

export default router