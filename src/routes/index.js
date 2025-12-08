import { Router } from 'express';
import loginRouter from './login';
import logoutRouter from './logout';
import signupRouter from './signup';
import forgotPasswordRouter from './forgot-password';
import verifyResetTokenRouter from './verify-reset-token';
import resetPasswordRouter from './reset-password';
import healthRouter from './health';

const router = Router();

router.use('/', loginRouter);
router.use('/', logoutRouter);
router.use('/', signupRouter);
router.use('/', forgotPasswordRouter);
router.use('/', verifyResetTokenRouter);
router.use('/', resetPasswordRouter);
router.use('/', healthRouter);

export default router;
