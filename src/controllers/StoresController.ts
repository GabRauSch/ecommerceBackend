import { Request, Response } from "express";
import Product from "../models/Products";
import { productById, productCreation } from "../validation/ProductsValidation";
import Category from "../models/Categories";
import Store from "../models/Stores";
import PatternResponses from "../utils/PatternResponses";
import { categoryid } from "../validation/CategorValidation";
import { idValidation } from "../validation/globalValidation";
import { storeCreation } from "../validation/StoreValidation";
import {v4 as uuidv4} from 'uuid';
import path from 'path';
import Jimp from "jimp";
import fs from 'fs'
import Users from "../models/Users";
import { staffMemberValidation } from "../validation/UserValidation";

class StoreController {
    public static async storeById(req: Request, res: Response){
        const {id} = req.params;

        const {error} = idValidation.validate(id)
        if (error) return res.status(400).json({ error: error.details[0].message });

        const store = await Store.findByPk(id);
        if(!store) return PatternResponses.error.notFound(res, 'store')
        return res.json(store)
    } 

    public static async allStores(req: Request, res: Response){
        const stores = Store.findAll();

        return stores
    }

    public static async createStore(req: Request, res: Response){
        const store = req.body;
        const file = req.file;      
        
        const {error} = storeCreation.validate(store)
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);
        

        if(!file) return PatternResponses.error.missingAttributes(res, 'file') 
        const fileName = `${uuidv4()}.png`;
        const outputPath = path.join(__dirname, '../../public/images', fileName);
        
        const maxWidth = 240; 
        const maxHeight = 300;

        const image = await Jimp.read(file.path);
        image.cover(maxWidth, maxHeight);

        await image.writeAsync(outputPath);
        fs.unlink(file.path, res=>null);
        
        const storeCreate = await Store.create(store)
        if(!storeCreate) return PatternResponses.error.notCreated(res, 'store')

        const setImage = await Store.setLogoImage(storeCreate.id, fileName);
        if(!setImage) return PatternResponses.error.notUpdated(res) 

        return PatternResponses.success.created(res)
    }

    public static async updateLogo(req: Request, res:  Response){
        const {storeId} = req.params
        const file = req.file;

        const {error} = idValidation.validate(storeId);
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

        if(!file) return PatternResponses.error.missingAttributes(res, 'file')
        
        const store = await Store.findByPk(storeId);
        if(!store) return PatternResponses.error.notFound(res, 'store');

        const oldImage = store.logoImage;

        const fileName = `${uuidv4()}.png`;
        const outputPath = path.join(__dirname, '../../public/images', fileName);
        const oldPath = path.join(__dirname, '../../public/images', oldImage)
        
        const maxWidth = 240; 
        const maxHeight = 300;

        const image = await Jimp.read(file.path);
        image.cover(maxWidth, maxHeight);

        await image.writeAsync(outputPath);
        fs.unlink(file.path, res=>null);
        fs.unlink(oldPath, res=>null)
    }

    public static async newStaffMember(req: Request, res: Response){
        const data = req.body;

        const {error} = staffMemberValidation.validate(data)
        const user = await Users.create(data)
        if(!user) return PatternResponses.error.notCreated(res, 'staff member');

        return PatternResponses.success.created(res, 'staff member')
    }
    public static async removeStaffMember(req: Request, res: Response){
        const {storeId, staffMemberId} = req.body

        const {error} = idValidation.validate(storeId) || idValidation.validate(staffMemberId);
        if (error) return PatternResponses.error.invalidAttributes(res, '', error.details[0].message);

        const user = await Users.findByPk(staffMemberId);
        if(!user) return PatternResponses.error.noRegister(res);

        if(user.storeId !== storeId) return PatternResponses.error.doesntBelong(res, 'user', 'store');

        try {
            const deletion = await user.destroy();
        } catch (error) {
            return PatternResponses.error.notDeleted(res)
        }
        
        return PatternResponses.success.deleted(res)
    }
}

export default StoreController