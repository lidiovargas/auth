import nodemailer from 'nodemailer';

const isSecure = process.env.EMAIL_SMTP_SECURE === 'true';

// Configuração base
const transportConfig = {
  host: process.env.EMAIL_SMTP_HOST,
  port: Number(process.env.EMAIL_SMTP_PORT),
  secure: isSecure, // Use `true` for port 465, `false` for all other ports
  // tls: {
  //   ciphers: 'SSLv3',
  //   rejectUnauthorized: false // Útil em dev se tiver problemas com certificados auto-assinados
  // },
};

// Só adiciona autenticação se houver usuário definido no .env
if (process.env.EMAIL_USER) {
  transportConfig.auth = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  };
}

const transporter = nodemailer.createTransport(transportConfig);

// Verificação de conexão ao iniciar (Opcional, mas útil para debug)
// Evite usar isso em Serverless/Lambda, mas em container é ok.
if (process.env.NODE_ENV !== 'test') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Erro na conexão SMTP:', error);
    } else {
      console.log('✅ Servidor SMTP pronto');
    }
  });
}

export default transporter;
