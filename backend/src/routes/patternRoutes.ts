import { Router } from 'express';
import { PatternInfoController } from '../controllers/PatternInfoController';

const router = Router();
const controller = new PatternInfoController();

router.get('/', controller.getPatterns);

export default router;
