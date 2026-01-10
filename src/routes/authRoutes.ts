import { Router } from 'express';
import multer from 'multer';
import * as authCtrl from '../controllers/authController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/upload-excel', upload.single('file'), authCtrl.bulkUpload);

export default router;