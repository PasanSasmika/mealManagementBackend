import { Router } from 'express';
import multer from 'multer';
import * as authCtrl from '../controllers/authController';

const Authrouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

Authrouter.post('/register', authCtrl.register);
Authrouter.post('/login', authCtrl.login);
Authrouter.post('/upload-excel', upload.single('file'), authCtrl.bulkUpload);

export default Authrouter;