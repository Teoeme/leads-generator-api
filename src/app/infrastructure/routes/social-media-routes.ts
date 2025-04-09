import { Router } from 'express';
import passport from 'passport';
import { SocialMediaAccountController } from '../controllers/SocialMediaAccountController';
import { InstagramController } from '../controllers/InstagramController';

const router = Router();
const accountController = new SocialMediaAccountController();
const instagramController = new InstagramController();

// Middleware para proteger rutas
const authenticate = passport.authenticate('jwt', { session: false });

// Rutas para cuentas de redes sociales
router.post('/accounts', authenticate, accountController.createAccount);
router.get('/accounts', authenticate, accountController.getAccounts);
router.get('/accounts/:id', authenticate, accountController.getAccount);
router.put('/accounts/:id', authenticate, accountController.updateAccount);
router.delete('/accounts/:id', authenticate, accountController.deleteAccount);
router.post('/accounts/:id/test', authenticate, accountController.testConnection);

// Rutas para Instagram
router.post('/instagram/login', authenticate, instagramController.login);
router.post('/instagram/logout', authenticate, instagramController.logout);
router.get('/instagram/profile/:username', authenticate, instagramController.getUserProfile);
router.get('/instagram/posts/:username', authenticate, instagramController.getUserPosts);
router.post('/instagram/extract/followers', authenticate, instagramController.extractLeadsFromFollowers);
router.post('/instagram/extract/likes', authenticate, instagramController.extractLeadsFromLikes);

export default router; 