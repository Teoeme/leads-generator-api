import { Router } from "express";
import { SimulatorSetController } from "../controllers/SimulatorSetController";
import passport from "passport";

const router = Router();

const simulatorSetController=SimulatorSetController.getInstance();
const authenticate = passport.authenticate('jwt', { session: false });


router.post('/add', authenticate, simulatorSetController.addSimulator);
router.post('/remove', authenticate, simulatorSetController.removeSimulator);
router.get('/list', authenticate, simulatorSetController.getSimulators);
router.post('/login', authenticate, simulatorSetController.login);

export default router;