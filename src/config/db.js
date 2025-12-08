import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error(
      'Erro Crítico: MONGO_URI não está definida nas variáveis de ambiente.'
    );
    // É crucial ter a URI do banco de dados, então encerramos o processo se estiver faltando.
    process.exit(1);
  }

  try {
    // Conecta ao MongoDB usando a URI fornecida
    await mongoose.connect(mongoUri); // Mongoose 6+ lida com as opções de parser internamente

    console.log('Conexão com MongoDB estabelecida com sucesso.');

    // Opcional: Ouvintes para eventos de conexão do Mongoose
    mongoose.connection.on('error', (err) => {
      console.error('Erro na conexão com MongoDB:', err);
      // Considerar tentar reconectar ou tomar outra ação aqui
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB desconectado.');
    });
  } catch (error) {
    console.error('Falha ao conectar com MongoDB:', error);
    // Encerra o processo em caso de falha inicial na conexão
    process.exit(1);
  }
};

// Exporta a função para ser usada em outro lugar (ex: server.ts)
export { connectDB };
