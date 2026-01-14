import { Router } from 'express';
import multer from 'multer';
import * as authCtrl from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const Authrouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

Authrouter.post('/register', authCtrl.register);
Authrouter.post('/login', authCtrl.login);
Authrouter.post('/upload-excel', upload.single('file'), authCtrl.bulkUpload);
Authrouter.get('/users', authenticate, authCtrl.getUsers);
Authrouter.put('/users/:id', authenticate, authCtrl.updateUser);
Authrouter.delete('/users/:id', authenticate, authCtrl.deleteUser);
Authrouter.post('/upload-excel', authenticate, authCtrl.bulkUpload);
export default Authrouter;