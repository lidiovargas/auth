import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', (req, res) => {
  // Verificação básica: Se a rota responde, o servidor HTTP está no ar.
  const healthcheck = {
    uptime: process.uptime(), // Tempo que o processo Node está rodando
    message: 'OK',
    timestamp: Date.now(),
    // Opcional: Adicionar status de dependências (ex: banco de dados)
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', // 1 = connected
  };

  try {
    // Se você incluiu a verificação do DB e ele não está conectado, retorne um erro
    if (mongoose.connection.readyState !== 1) {
      return res
        .status(503)
        .send({ status: 'error', message: 'Database disconnected' });
    }

    res.status(200).send(healthcheck); // Retorna 200 OK com algumas infos
  } catch (e) {
    healthcheck.message = e.message;
    res.status(503).send(); // 503 Service Unavailable indica que o serviço está temporariamente fora
  }
});

export default router;
