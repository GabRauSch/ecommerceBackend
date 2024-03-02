import { Router } from "express";
import StoreController from '../controllers/StoresController';
import { upload } from "../config/multer";

const router = Router();

router.get('/:id', StoreController.storeById);
router.get('/all', StoreController.allStores);

router.post('/create', upload.single('file'), StoreController.createStore);
router.post('/staffMember', StoreController.newStaffMember)

router.delete('/staffMemeber', StoreController.removeStaffMember)

export default router