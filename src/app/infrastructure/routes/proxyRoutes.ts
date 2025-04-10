import express from 'express';
import { ProxyController } from '../../application/controllers/ProxyController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();
const proxyController = new ProxyController();

// Middleware de autenticación para todas las rutas
router.use(authenticateJWT);

// Rutas para proxies
router.get('/', proxyController.getProxies);
router.get('/available', proxyController.getAvailableProxies);
router.get('/:id', proxyController.getProxyById);
router.post('/', proxyController.createProxy);
router.put('/:id', proxyController.updateProxy);
router.delete('/:id', proxyController.deleteProxy);
router.post('/:id/check', proxyController.checkProxyStatus);

export default router; 