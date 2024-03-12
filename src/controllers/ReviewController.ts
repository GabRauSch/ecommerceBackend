import PatternResponses from "../utils/PatternResponses";
import { idValidation } from "../validation/globalValidation";
import { Request, Response } from "express";
import productId from "../models/Reviews";
import { createReviewValidation } from "../validation/ReviewValidation";
import Review from "../models/Reviews";
import { getIntervalFromDate } from "../utils/Dates";

class ReviewController{

    public static async createReview(req: Request, res:Response){
        const review = req.body;

        const {error} = createReviewValidation.validate(review)
        if (error) return res.status(400).json({ error: error.details[0].message });

        const existReview = await Review.findOne({where:{userId: review.userId, productId: review.productId}})

        if(existReview){
            const reviewUpdate = await existReview.update(review)
            if(!reviewUpdate) return PatternResponses.error.notUpdated(res, 'review')

            return PatternResponses.success.updated(res)
        }

        const reviewCreation = await Review.create(review)
        if(!reviewCreation) return PatternResponses.error.notCreated(res, 'review')
        
        return PatternResponses.success.created(res)       
    }

    public static async findReviewsByProductId(req: Request, res: Response){
        const {productId} = req.params;

        const {error} = idValidation.validate(productId)
        if (error) return res.status(400).json({ error: error.details[0].message });

        const reviews = await Review.findByProductId(parseInt(productId));
        if(!reviews) return PatternResponses.error.noRegister(res);

        const data = reviews.map((review)=>{
            const {createdAt, ...left} = review;
            const timePosted = getIntervalFromDate(createdAt)
            return {
                ...left,
                timePosted
            }
        })

        return res.json(data)
    } 
}
export default ReviewController