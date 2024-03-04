import { Request, Response } from "express";
import Product from "../models/Products";
import PatternResponses from "../utils/PatternResponses";
import { purchaseValidation } from "../validation/PurchaseValidation";
import { UserAttributes } from "../models/Users";
import Purchase from "../models/Purchases";
import { idValidation } from "../validation/globalValidation";

class PurchaseController {
    static async purchaseItem(req: Request, res: Response){
        const {productId, quantity} = req.body;
        const {user} = req;
        
        const {error} = purchaseValidation.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });
        if(!user) return PatternResponses.error.notAuthorized(res)
        
        const userId = (user as UserAttributes).id;
        
        const purchaseInfo = await Product.findInfoForPurchase(productId);
        if(!purchaseInfo) return PatternResponses.error.notFound(res, 'product');
        const data = {
            productId,
            productName: purchaseInfo.name,
            productImage: purchaseInfo.image,
            quantity, 
            totalValue: purchaseInfo.unitPrice * quantity - purchaseInfo.discount,
            userId,
            pendent: true
        }

        const purchaseAction = await Purchase.create(data)
        if(!purchaseAction) return PatternResponses.error.notCreated(res, 'purchase')

        return PatternResponses.success.created(res)
    } 

    static async confirmPurchase(req: Request, res: Response){
        const {purchaseId} = req.params;

        const {error} = idValidation.validate(purchaseId);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const purchase = await Purchase.findByPk(purchaseId, {attributes: ['id']});
        if(!purchase) return PatternResponses.error.noRegister(res);

        purchase.update({pendent: false})
    }
    static async removePurchase(req: Request, res: Response){
        const {purchaseId} = req.params;

        const {error} = idValidation.validate(purchaseId);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const purchase = await Purchase.findByPk(purchaseId, {attributes: ['id']});
        if(!purchase) return PatternResponses.error.noRegister(res);

        try {
            purchase.destroy();       
            return PatternResponses.error.notDeleted(res)
        } catch (error) {
            return PatternResponses.error.notDeleted(res)
        }
    }

}

export default PurchaseController