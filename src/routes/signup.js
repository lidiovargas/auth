import express from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';

import { BadRequestError } from '@lidiovargas/errors';
import { MongoServerError } from '@lidiovargas/errors';
import { Password } from '../services/password';

import { validateSchema } from '../middlewares/validate-schema';

import { Duration } from 'luxon';

const router = express.Router();

router.post('/signup', validateSchema('entities/user.entity.schema.json'), async (req, res, next) => {
  const { email, password, name, additionalName, birthDate, gender } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new BadRequestError({ message: 'Email in use', prop: 'email' }));
  }

  /** TODO: verify email property
   * Para garantir que o usuário tem posse do email, é ncessário
   * verificar esse email.
   * Também é uma forma de usar autenticação de dois fatores,
   * sendo o segundo fator o próprio email, quando o usuário não
   * quiser
   *
   */

  // TODO: validate password complexity

  // hash the password
  const hashedPassword = await Password.toHash(password);

  //save to database
  const user = new User({
    email,
    password: hashedPassword,
    name,
    additionalName,
    birthDate,
    gender,
  });

  try {
    await user.save();
  } catch (e) {
    return next(new MongoServerError(e));
  }

  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const payload = {
    id: user.id,
    email: user.email,
    ip: clientIp,
  };

  // Generate JWT
  const expiration = Duration.fromMillis(process.env.ACCESS_TOKEN_EXPIRATION * 1000);

  const token = jwt.sign(payload, process.env.JWS_SIGN_SECRET, {
    algorithm: process.env.JWS_ALGORITHM,
    expiresIn: expiration.toMillis() / 1000, // time in vercel/ms or seconds
  });

  res.cookie('access_token', token, {
    // httpOnly: true,
    maxAge: expiration.toMillis(), // in milliseconds
  });

  res.status(201).send(payload);
});

export default router;
