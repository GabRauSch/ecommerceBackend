import ProductModel from './models/Products';
import express, { ErrorRequestHandler, Request, Response } from 'express';
import { limiter } from './config/Limiter'
import cors from 'cors';
import helmet from 'helmet';
import { sessionConfig } from './config/Session';
import Auth from './routes/Auth'
import Product from './routes/Product'
import { Model } from 'sequelize';
import CategoryModel from './models/Categories';
import StoreModel from './models/Stores';
import Category from './routes/Category'
import Discount from './routes/Discount';
import DiscountModel from './models/Discounts';
import PurchaseModel from './models/Purchases';
import path from 'path'
import { corsOptions } from './config/cors';
import Purchase from './routes/Purchase';
import { MulterError } from 'multer';
import Admin from './routes/Admin'
import PatternResponses from './utils/PatternResponses';

if(process.env.ENV == 'HOMOLOG'){
    ProductModel.sync()
    CategoryModel.sync()
    StoreModel.sync()   
    DiscountModel.sync()
    PurchaseModel.sync()
}

const app = express();

app.use(express.static(path.join(__dirname, '../public')))

app.use(cors(corsOptions));
app.use(limiter);
app.use(helmet());
app.use(sessionConfig);

app.use(express.json())

app.use('/auth', Auth);
app.use('/product', Product)
app.use('/category', Category)
app.use('/discount', Discount)
app.use('/purchase', Purchase)
app.use('/admin', Admin)

app.use((req: Request, res: Response)=>{
    res.status(404)
    return PatternResponses.error.notFound(res, 'route')
})

const errorHandler: ErrorRequestHandler = (err, req, res, next)=>{
    res.status(400);

    if(err instanceof MulterError){
        return res.json({error: err.code})
    }
    return res.json(err)
}
app.use(errorHandler)


export default app

