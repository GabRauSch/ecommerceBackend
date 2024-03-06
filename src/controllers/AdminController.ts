import { Request, Response } from "express";
import { idValidation } from "../validation/globalValidation";
import Purchase from "../models/Purchases";
import PatternResponses from "../utils/PatternResponses";
import { createDatesObject } from "../utils/Dates";
import Product from "../models/Products";

class AdminController {
   static async overview(req: Request, res: Response){
      const { storeId } = req.params;
      const { startDate, endDate } = req.query;

      const { error } = idValidation.validate(storeId);
      if (error) return res.status(400).json(error.details[0].message);

      let startDateParsed;
      let endDateParsed;

      if (!startDate || !endDate) {
         const today = new Date();
         const year = today.getFullYear();
         const month = String(today.getMonth() + 1).padStart(2, '0'); 
         startDateParsed = `${year}-${month}-01`;
         endDateParsed = `${year}-${month}-${String(today.getDate()).padStart(2, '0')}`;
      } else {
         startDateParsed = startDate as string;
         endDateParsed = endDate as string;

         if (new Date(startDateParsed) > new Date(endDateParsed)) {
            return res.status(400).json("Start date cannot be after end date.");
        }
      }

      const datesObject = createDatesObject(startDateParsed.toString(), endDateParsed.toString());
   
      const overviewInfo = await Purchase.findOverviewInfo(parseInt(storeId), datesObject);


      return res.json(overviewInfo)
   }

   public static async analyticProductInfo(req: Request, res: Response){
      const {storeId} = req.params;
      const {reverse, analyse} = req.query;

      const {error} = idValidation.validate(storeId);
      if (error) return res.status(400).json({error: error.details[0].message});

      const order = reverse ? 'ASC' : 'DESC'
      if((analyse !== 'qt') && (analyse !== 'evaluation')) return PatternResponses.error.invalidAttributes(res, 'analyse')

      const products = await Product.findAnalyticInfo(parseInt(storeId), order, analyse);
      return res.json(products)
  }


  public static async analyticClientInfo(req: Request, res: Response){
      const {storeId} = req.params;
      const {reverse, analyse} = req.query;

      const {error} = idValidation.validate(storeId);
      if (error) return res.status(400).json({error: error.details[0].message});

      const order = reverse ? 'ASC' : 'DESC'
      if(analyse !== 'totalValue') return PatternResponses.error.invalidAttributes(res, 'analyse')

      const products = await Purchase.findAnalyticInfo(parseInt(storeId), order, analyse);
      return res.json(products)
   }

   public static analyticPurchaseInfo(req: Request, res: Response){

   }   
}

export default AdminController