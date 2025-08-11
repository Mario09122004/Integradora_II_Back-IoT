import exepress from 'express';
import { sendEmail } from '../controller/emailController.js';

const router = exepress.Router();
router.post('/send',sendEmail);

export default router;