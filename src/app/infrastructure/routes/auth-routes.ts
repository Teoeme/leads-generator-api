import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import passport from 'passport';

const router = Router();
const authController = new AuthController();
const authenticate=passport.authenticate('jwt',{session:false});


router.post('/register',authenticate, authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authenticate, authController.refreshToken);
router.get('/check', authenticate, authController.check);
export default router; 