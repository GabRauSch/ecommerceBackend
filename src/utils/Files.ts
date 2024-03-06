import {v4 as uuidv4 } from 'uuid'
import path from 'path';
import Jimp from 'jimp';
import fs from 'fs'
import PatternResponses from './PatternResponses';

export const setFileName = ()=>{
    const fileName = `${uuidv4()}.png`;
    return fileName
}

export const removeFile = async (filePath: string)=>{
    fs.unlink(filePath, res=>null);
}

export const uploadFile = async (file: Express.Multer.File, fileName: string)=>{
    const outputPath = path.join(__dirname, '../../public/images', fileName);

    const maxWidth = 240; 
    const maxHeight = 300;

    const image = await Jimp.read(file.path);
    image.cover(maxWidth, maxHeight);

    await image.writeAsync(outputPath);
    console.log(file.path)
    fs.unlink(file.path, res=>null);
}