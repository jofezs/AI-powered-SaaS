import { Router } from 'express';
import { protect } from '../middleware/protect';
import { chatWithAI } from '../controllers/aiController';

const router = Router();
router.use(protect);
router.post('/chat', chatWithAI);
export default router;