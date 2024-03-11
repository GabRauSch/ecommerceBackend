import { Router } from "express";
import ReviewController from "../controllers/ReviewController";

const router = Router();

router.post('/', ReviewController.createReview);
router.get('/:productId', ReviewController.findReviewsByProductId)

export default router