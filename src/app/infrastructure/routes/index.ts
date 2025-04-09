import { Router } from 'express';
import authRoutes from './auth-routes';
import userRoutes from './user-routes';
import socialMediaRoutes from './social-media-routes';
import leadRoutes from './lead-routes';
import simulationRoutes from './simulation-routes';
import simulatorSetRoutes from './simulator-set-routes';
import campaignRoutes from './campain-routes';
const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/social-media', socialMediaRoutes);
router.use('/leads', leadRoutes);
router.use('/simulations', simulationRoutes);
router.use('/simulatorsset', simulatorSetRoutes);
router.use('/campaigns', campaignRoutes);
export default router; 