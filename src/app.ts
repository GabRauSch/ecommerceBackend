import express from 'express';
import { limiter } from './config/Limiter'
import cors from 'cors';
import helmet from 'helmet';
import { sessionConfig } from './config/Session';
import Auth from './routes/Auth'

const app = express();

app.use(cors());
app.use(limiter);
app.use(helmet());
app.use(sessionConfig);

//middleware
// app.use(()=>{
//     console.log('middleware')
// })

app.use(Auth)



export default app

