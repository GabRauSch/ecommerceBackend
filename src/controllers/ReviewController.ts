import PatternResponses from "../utils/PatternResponses";
import { idValidation } from "../validation/globalValidation";
import { Request, Response } from "express";
import productId from "../models/Reviews";
import { createReviewValidation } from "../validation/ReviewValidation";
import Review from "../models/Reviews";

class ReviewController{

    public static async createReview(req: Request, res:Response){
        const review = req.body;

        const {error} = createReviewValidation.validate(review)
        if (error) return res.status(400).json({ error: error.details[0].message });

        const reviewCreation = await Review.create(review)
        if(!reviewCreation) return PatternResponses.error.notCreated(res, 'review')
        
        return PatternResponses.success.created(res)       
    }
}
export default ReviewController