/** Verifica se o token é valido:
 * se existe na base de dados,
 * e ainda não expirou */

import express from 'express';
import { NotFoundError } from '@lidiovargas/errors';
import { PasswordResetToken } from '../models/password-reset';
const router = express.Router();

router.get('/verify-reset-token/:token', async (req, res, next) => {
  const { token } = req.params;

  const result = await PasswordResetToken.find({ token });
  if (result.length === 0) return next(new NotFoundError({ field: 'token', message: 'Token not found' }));

  return res.status(204).send();
});

export default router;
