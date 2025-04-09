import { Router } from 'express';
import passport from 'passport';
import { SimulationController } from '../controllers/SimulationController';
import { SimulationExamplesController } from '../controllers/SimulationExamplesController';

const router = Router();
const simulationController = new SimulationController();
const examplesController = new SimulationExamplesController();

// Middleware para proteger rutas
const authenticate = passport.authenticate('jwt', { session: false });

// Rutas para simulación
router.post('/start', authenticate, simulationController.startSimulation);
router.post('/stop/:simulationId', authenticate, simulationController.stopSimulation);
router.get('/active', authenticate, simulationController.getActiveSimulations);

// Rutas para ejemplos de simulación
router.post('/examples/followers', authenticate, examplesController.startFollowersExample);
router.post('/examples/hashtag', authenticate, examplesController.startHashtagExample);
router.post('/examples/post', authenticate, examplesController.startPostInteractionExample);
router.post('/examples/profile', authenticate, examplesController.startProfileExplorationExample);

export default router; 