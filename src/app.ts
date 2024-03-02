import ProductModel from './models/Products';
import express from 'express';
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

if(process.env.ENV == 'HOMOLOG'){
    ProductModel.sync()
    CategoryModel.sync()
    StoreModel.sync()   
}

const app = express();

app.use(cors());
app.use(limiter);
app.use(helmet());
app.use(sessionConfig);

app.use(express.json())

app.use('/auth', Auth);
app.use('/product', Product)
app.use('/category', Category)



export default app

