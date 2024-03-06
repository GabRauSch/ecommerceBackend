import { Request, Response } from "express";
import { idValidation } from "../validation/globalValidation";
import Purchase from "../models/Purchases";
import PatternResponses from "../utils/PatternResponses";

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

      const overviewInfo = await Purchase.findOverviewInfo(parseInt(storeId), startDateParsed, endDateParsed);


      return res.json(overviewInfo)
   }
}

export default AdminController