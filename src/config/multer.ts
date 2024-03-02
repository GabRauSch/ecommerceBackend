import multer from 'multer';

const storage = multer.memoryStorage();
export const upload = multer({
    dest: './tmp',
    fileFilter: (req, file, callBack)=>{
        console.log(file.mimetype)
        const allowed: string[] = ['image/jpg', 'image/jpeg', 'image/png']
        callBack(null, allowed.includes(file.mimetype))
    },
    limits: {fieldSize: 20000000}
})
