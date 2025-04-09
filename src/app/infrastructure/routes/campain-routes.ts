import { Router } from "express";
import { CampainController } from "../controllers/CampainController";
import { MongoCampainRepository } from "../repositories/mongodb/MongoCampainRepository";
import passport from "passport";
const router = Router();

const campainRepository = new MongoCampainRepository();
const campainController = new CampainController(campainRepository);

const authenticate=passport.authenticate('jwt',{session:false});

router.post('/',authenticate, campainController.createCampain);
router.get('/:id', authenticate, campainController.getCampainById);
router.put('/:id', authenticate, campainController.updateCampain);
router.delete('/:id', authenticate, campainController.deleteCampain);
router.get('/', authenticate, campainController.getCampains);

export default router;