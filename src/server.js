import express from 'express';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { connectDB } from './config/db';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

// Carrega variáveis do .env
dotenv.config();

// Initialize Server
const server = express();

// Conectar ao Banco de Dados
connectDB();

// --- Configuração do CORS ---
// REMOVIDA COMPLETAMENTE.
// O Nginx (Gateway) agora é responsável por bloquear/liberar origens.
// O Express confia que, se a requisição chegou até aqui (via rede interna Docker),
// ela já foi validada pelo Nginx.

// Middlewares
server.use(express.json()); // Para parsear JSON body

// Cookies
// --- IMPORTANTE: Trust Proxy ---
// Como você está atrás de um proxy (Nginx), você DEVE manter isso true.
// Isso faz o Express confiar nos headers X-Forwarded-For e X-Forwarded-Proto
// que configuramos no Nginx. Sem isso, cookies 'secure' podem falhar.
server.set('trust proxy', true);
server.use(cookieParser());

// Rota Raiz Simples
const baseUrl = process.env.BASE_URL || '/';
server.use(baseUrl, apiRouter);

// Rota principal
server.get('/', (req, res) => {
  res.send('Auth API is running!');
});

server.all('*', (req, res, next) => {
  throw new NotFoundError('Not Found');
});

server.use(errorHandler);

export { server };
