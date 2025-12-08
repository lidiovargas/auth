import 'dotenv';
import { server } from './server';

const PORT = process.env.PORT || 4010;

async function start() {
  if (!process.env.JWS_SIGN_SECRET || !process.env.JWS_VERIFY_SECRET) {
    throw new Error('JWT_SIGN_SECRET and JWT_VERIFY_SECRET must be defined');
  }

  server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start().catch(console.dir);
