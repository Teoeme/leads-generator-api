import { Router } from 'express';
import passport from 'passport';
import { SocialMediaAccountController } from '../controllers/SocialMediaAccountController';

const router = Router();
const accountController = new SocialMediaAccountController();

// Middleware para proteger rutas
const authenticate = passport.authenticate('jwt', { session: false });

// Rutas para cuentas de redes sociales
router.post('/accounts', authenticate, accountController.createAccount);
router.get('/accounts', authenticate, accountController.getAccounts);
router.get('/accounts/:id', authenticate, accountController.getAccount);
router.put('/accounts/:id', authenticate, accountController.updateAccount);
router.delete('/accounts/:id', authenticate, accountController.deleteAccount);
router.post('/accounts/:id/test', authenticate, accountController.testConnection);



export default router; 