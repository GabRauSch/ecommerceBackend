import ProductModel from './models/Product';
import express from 'express';
import { limiter } from './config/Limiter'
import cors from 'cors';
import helmet from 'helmet';
import { sessionConfig } from './config/Session';
import Auth from './routes/Auth'
import Product from './routes/Product'
import { Model } from 'sequelize';

if(process.env.ENV == 'HOMOLOG')
{
    ProductModel.sync()
}

const app = express();

app.use(cors());
app.use(limiter);
app.use(helmet());
app.use(sessionConfig);

app.use(express.json())

app.use('/auth', Auth);
app.use('/product', Product)



export default app

