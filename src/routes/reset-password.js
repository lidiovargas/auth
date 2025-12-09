/** Password Reset
 *
 * Reseta o password, através de token que o dono do email cadastrado
 * cadastrado recebeu.*/

import express from 'express';
import { validateSchema } from '../middlewares/validate-schema';
import { PasswordResetToken } from '../models/password-reset';
import { User } from '../models/user';
import { MongoServerError } from '@lidiovargas/errors';
import { NotFoundError } from '@lidiovargas/errors';
import { Password } from '../services/password';

const router = express.Router();

router.patch(
  '/reset-password',
  validateSchema('contracts/auth/reset-password.request.schema.json'),
  async (req, res, next) => {
    const { token, password } = req.body;

    const result = await PasswordResetToken.find({ token });
    if (result.length === 0) return next(new NotFoundError({ field: 'token', message: 'Token not found' }));

    // TODO: validate password complexity

    // hash the password
    const hashedPassword = await Password.toHash(password);

    try {
      const modified = await User.findByIdAndUpdate(
        //id
        result[0].userId,
        // update object
        {
          password: hashedPassword,
        }
      );
      if (!modified) return next(new NotFoundError('User not found'));
    } catch (err) {
      console.error(err);
      return next(new MongoServerError(err));
    }

    // após uso do token, este precisa ser excluído
    try {
      await PasswordResetToken.deleteOne({ token });
    } catch (err) {
      return next(new MongoServerError(err));
    }

    // TODO: enviar aviso por email que a senha foi mudada.

    return res.status(204).send({});
  }
);

export default router;
