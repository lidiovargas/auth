/**
 * Password Reset Token
 *
 * Envia um email com token válido por tempo limitado, por
 * exemplo 15min, que poderá ser usado para resetar o password.
 *
 */

import express from 'express';
import { User } from '../models/user';
import { BadRequestError } from '@lidiovargas/errors';
import crypto from 'crypto';

import transporter from '../services/send-email';

import { PasswordResetToken } from '../models/password-reset';
import { MongoServerError } from '@lidiovargas/errors';

import { validateSchema } from '../middlewares/validate-schema';
import { ServerError } from '@lidiovargas/errors';

const router = express.Router();

router.post(
  '/forgot-password',

  validateSchema('contracts/auth/forgot-password.request.schema.json'),

  async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      return next(
        new BadRequestError({
          field: 'email',
          message: 'Email cannot be empty',
        })
      );
    }

    const user = await User.find({ email });

    // check if email exists
    if (user?.length === 0) {
      console.error(
        new BadRequestError({
          field: 'email',
          message: 'Email not found',
          value: email,
        })
      );
      return res.status(201).send({
        message: `Se o email ${email} existir em nossa base, um link de recuperação foi enviado.`,
      });
    }

    // check for duplicated emails
    // Se você tem emails duplicados no banco, seu banco está modelado errado.
    // O campo email na coleção de Users deve ter um índice unique: true no MongoDB.
    // Essa validação deve ser garantida pelo banco, não pelo código da rota.
    if (user?.length > 1) {
      return next(
        new BadRequestError({
          field: 'email',
          message: 'Duplicate emails found',
          value: email,
        })
      );
    }

    // save the token in database
    const token = crypto.randomBytes(64).toString('hex');

    const passwordResetToken = new PasswordResetToken({
      userId: user[0].id,
      token,
    });

    try {
      await passwordResetToken.save();
    } catch (err) {
      return next(new MongoServerError(err));
    }

    // send email with the token
    try {
      const to = process.env.NODE_ENV === 'prod' ? email : 'vargas.lidio@gmail.com';

      if (process.env.NODE_ENV === 'test') {
        return res.status(201).send({ token });
      } else {
        const resetLink = `${process.env.CLIENT_BASE_URL}/study-control/auth/verify-reset-token?token=${token}`;
        const info = await transporter.sendMail({
          from: '"Lidio Vargas" <lidio@lidiovargas.com>',
          to,
          subject: 'Meus Estudos | recuperação de senha',
          html: `<p>Oi ${user[0].name}!</p>
  
          <p>Você esqueceu sua senha e quer criar uma nova, certo?</p>
          <p><a href="${resetLink}">Crie uma nova senha</a></p>
  
          <p>O link é válido por 15 minutos.</p>
  
          <p>Att.</p>
  
          `,
        });
        return res.status(201).send({
          message: `Se o email ${email} existir em nossa base, um link de recuperação foi enviado.`,
        });
      }
    } catch (err) {
      console.log(err);

      return next(new ServerError('Check email failed'));
    }
  }
);

export default router;
