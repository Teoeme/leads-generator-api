import { Router } from 'express';
import passport from 'passport';
import { LeadController } from '../controllers/LeadController';

const router = Router();
const leadController = new LeadController();

// Middleware para proteger rutas
const authenticate = passport.authenticate('jwt', { session: false });

// Rutas para leads
router.get('/', authenticate, leadController.getLeads);
router.get('/:id', authenticate, leadController.getLead);
router.put('/:id', authenticate, leadController.updateLead);
router.delete('/:id', authenticate, leadController.deleteLead);
router.put('/:id/status', authenticate, leadController.updateLeadStatus);
router.get('/search/:query', authenticate, leadController.searchLeads);

// Rutas para extracción de leads
router.post('/extract/instagram/followers', authenticate, leadController.extractLeadsFromFollowers);
router.post('/extract/instagram/likes', authenticate, leadController.extractLeadsFromLikes);

export default router; 