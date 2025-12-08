import express from 'express';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '../errors/bad-request-error';
import { Password } from '../services/password';
import { User } from '../models/user';
import { validateSchema } from '../middlewares/validate-schema';
import { NotFoundError } from '../errors/not-found-error';
import { Duration } from 'luxon';

const router = express.Router();

router.post(
  '/login',
  validateSchema('contracts/auth/login.request.schema.json'),
  async (req, res, next) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(
        new NotFoundError({
          message: 'Email Not Found',
          field: 'email',
          value: email,
        })
      );
    }

    try {
      const passwordMatch = await Password.compare(
        password || '',
        existingUser.password
      );
      if (!passwordMatch) throw new Error();
    } catch (err) {
      // console.error(err);
      return next(
        new BadRequestError({
          message: 'Invalid password',
          field: 'password',
        })
      );
    }

    // TODO: timer if the same IP try for some times

    /** TODO: One-Time-Password (OTP)
     * Se o usuário não tem autenticação em duas etapas (F2A),
     * e a senha for comprometida, o fraudador terá acesso.
     * É boa prática gerar uma senha de um só uso e enviar ao
     * ao email cadastrado, para resguardar o usuário real de
     * violação ao seus dados QUANDO sua senha for comprometida.
     * Veja que não é SE, mas QUANDO.
     * EX: Mongo Cloud usa MFA Multifactor Authentication,
     * podendo selecionar dois ou mais. Assim, será solicitado
     * a senha, e pelo menos mais um desses escolhidos, que é
     * SMS, Aplicativo Autenticador, Email, dentre outros.
     * Assim, um email é um fator de segunda autenticação,
     * quando o usuário não tem hábito de habilitar outros
     * segundos fatores.
     */

    const clientIp =
      req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const payload = {
      id: existingUser.id,
      email: existingUser.email,
      ip: clientIp,
    };

    // Generate JWT
    const expiration = Duration.fromMillis(
      process.env.ACCESS_TOKEN_EXPIRATION * 1000
    );

    const token = jwt.sign(payload, process.env.JWS_SIGN_SECRET, {
      algorithm: process.env.JWS_ALGORITHM,
      expiresIn: expiration.toMillis() / 1000, // time in vercel/ms or seconds
    });

    // TODO: transferir `lidiovargas.com` para variável de ambiente

    const nodeEnv = process.env.NODE_ENV || 'developtment';
    const domain = process.env.AUTHN_DOMAIN;

    if (!domain) {
      console.error(
        'A variável de ambiente AUTHN_DOMAIN deve estar configurada'
      );
      res.status(500).json({ message: 'Erro de configuração de servidor' });
    }

    const cookieOptions = {
      maxAge: expiration.toMillis(), // in milliseconds
      // expires: new Date(Date.now() + 3600000), // Ou data de expiração explícita
      httpOnly: nodeEnv === 'production' ? false : false, // Impede acesso via JavaScript no cliente (mais seguro) // not seen when used 'document.cookie' in javascript browser
      secure: nodeEnv === 'production' ? true : false, // Enviar cookie apenas sobre HTTPS (essencial!)
      path: '/', // Disponível em todo o domínio
      domain: domain, // <-- A CHAVE! Define o escopo para o domínio pai e subdomínios
      sameSite: 'Lax', // Recomendado para proteção CSRF ('Strict', 'Lax', ou 'None'. 'None' requer Secure=true)
    };

    // Store it on cookie
    res.cookie('access_token', token, cookieOptions);

    res.status(200).send({ id: existingUser.id });
  }
);

export default router;
