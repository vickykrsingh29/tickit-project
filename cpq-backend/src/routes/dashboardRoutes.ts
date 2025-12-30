import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { checkJwt } from '../middlewares/auth';

const router = Router();

router.use(checkJwt);

router.get('/', getDashboardData);

export default router;