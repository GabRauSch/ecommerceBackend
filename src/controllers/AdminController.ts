import { Request, Response } from "express";
import { idValidation } from "../validation/globalValidation";
import Purchase from "../models/Purchases";
import PatternResponses from "../utils/PatternResponses";
import { createDatesObject, getIntervalFromDate } from "../utils/Dates";
import Product from "../models/Products";
import Users from "../models/Users";

class AdminController {
   static async overview(req: Request, res: Response){
      const { storeId } = req.params;
      const { startDate, endDate, fullPeriod } = req.query;


      const { error } = idValidation.validate(storeId);
      if (error) return res.status(400).json(error.details[0].message);

      let startDateParsed;
      let endDateParsed;

      if(startDate == 'fullPeriod'){
         const data = await Purchase.findAllOverViewInfo(parseInt(storeId));
         return res.json(data)
      }

      if(!startDate){
         const today = new Date();
         const year = today.getFullYear();
         const month = String(today.getMonth() + 1).padStart(2, '0'); 
         startDateParsed = `${year}-${month}-01`;
         endDateParsed = `${year}-${month}-${String(today.getDate()).padStart(2, '0')}`;
      } 

      if(!endDate && startDate){
         const startDatePrep = new Date(startDate as string);
         const endDatePrep = new Date(startDatePrep.getUTCFullYear(), startDatePrep.getUTCMonth() + 1, 0);
         endDateParsed = `${endDatePrep.getFullYear()}-${endDatePrep.getUTCMonth()  +1}-${String(endDatePrep.getDate()).padStart(2, '0')}`;
         startDateParsed = startDate as string
      }
      if(startDate && endDate){
         endDateParsed = endDate as string;
         startDateParsed = startDate as string
      }

      console.log(startDateParsed, endDateParsed)
      const datesObject = createDatesObject(startDateParsed as string, endDateParsed as string);

      const overviewInfo = await Purchase.findOverviewInfo(parseInt(storeId), datesObject);

      return res.json(overviewInfo)
   }

   static async salesOverView(req: Request, res: Response){
      const {storeId} = req.params;

      const {error} = idValidation.validate(storeId);
      if (error) return res.status(400).json({error: error.details[0].message});

      console.log(storeId)
      const sales = await Purchase.findAnalyticSales(parseInt(storeId));
      return res.json(sales)
   }
   public static async analyticProductInfo(req: Request, res: Response){
      const {storeId} = req.params;

      const {error} = idValidation.validate(storeId);
      if (error) return res.status(400).json({error: error.details[0].message});

      const products = await Product.findAnalyticInfo(parseInt(storeId));
      if(!products) return PatternResponses.error.noRegister(res)

      const dataTrasnformed = products.map((el)=>{
         const {id, ...left} = el 
         const info = Object.values(left)
         return {id, info}
      })

      return res.json(dataTrasnformed)
  }

  public static async analyticClientInfo(req: Request, res: Response){
      const {storeId} = req.params;

      const {error} = idValidation.validate(storeId);
      if (error) return res.status(400).json({error: error.details[0].message});

  
      const products = await Purchase.findAnalyticInfo(parseInt(storeId));
      if(!products) return PatternResponses.error.noRegister(res)

      const dataTrasnformed = products.map((el)=>{
         const {id, ...left} = el 
         const info = Object.values(left)
         return {id, info}
      })
      return res.json(dataTrasnformed)
   }

   public static async analyticSales(req: Request, res: Response){
      const {storeId} = req.params;

      const {error} = idValidation.validate(storeId);
      if (error) return res.status(400).json({error: error.details[0].message});

      const sales = await Purchase.findSales(parseInt(storeId))
      if(!sales) return PatternResponses.error.noRegister(res);
      const dataTrasnformed = sales.map((el: any)=>{
         const {id, ...left} = el 
         const info = Object.values(left)
         return {id, info}
      })

      return res.json(dataTrasnformed)
   }   

   public static async clientsOverView(req: Request, res: Response){
      const {storeId} = req.params;
      const {error} = idValidation.validate(storeId);
      if(error) return res.status(400).json({error: error.details[0].message})

      const clients = await Users.findClientsOverView(parseInt(storeId));
      return res.json(clients)
   }
   public static async analyticClients(req: Request, res: Response){
      const {storeId} = req.params;
      const {error} = idValidation.validate(storeId);
      if(error) return res.status(400).json({error: error.details[0].message})

      const clients = await Users.findClients(parseInt(storeId));
      if(!clients) return PatternResponses.error.noRegister(res);


      const dataTrasnformed = clients.map((el)=>{
         el.firstPurchase = getIntervalFromDate(el.firstPurchase)
         el.lastPurchase = getIntervalFromDate(el.lastPurchase);
         const {id, ...left} = el;
         console.log(el.firstPurchase)

         const info = Object.values(left)
         return {id, info}
      })

      return res.json(dataTrasnformed)
   }
   static async productsAllinfo(req: Request, res: Response){
      const {storeId} = req.params;

      const {error} = idValidation.validate(storeId);
      if(error) return res.status(400).json({error: error.details[0].message})

      const products = await Product.findAllInfo(parseInt(storeId));
      if(!products) return PatternResponses.error.noRegister(res);


      const dataTrasnformed = products.map((el: any)=>{
         const {id, ...left} = el;

         const info = Object.values(left)
         return {id, info}
      })

      return res.json(dataTrasnformed)
   }
}

export default AdminController