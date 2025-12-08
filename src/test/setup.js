// import 'regenerator-runtime/runtime';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { OpenFgaClient } from '@openfga/sdk';
import { authrnCreateAll } from './authrn/create';

const uri =
  'mongodb://root:example@localhost:27017/study_control_test?authSource=admin';

beforeAll(async () => {
  try {
    await mongoose.connect(uri);
  } catch (err) {
    console.log('Failed to connect to MongoDB', err);
  }

  try {
    const { storeId, modelId } = await authrnCreateAll('Study Control TEST');
    global.fgaClient = new OpenFgaClient({
      apiUrl: process.env.AUTHRN_API_URL, // required, e.g. https://api.fga.example
      storeId: storeId,
      authorizationModelId: modelId, // Optional, can be overridden per request
    });
  } catch (err) {
    console.error('Failed to connect to TEST Authorization Store in Open FGA');
  }
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

global.ACCESS_TOKEN_EXPIRATION = 300;
global.JWS_SIGN_SECRET = 'abcde';
global.JWS_VERIFY_SECRET = 'abcde';
global.JWS_ALGORITHM = 'HS256';

global.signup = (userId) => {
  // Build a JWT payload. { id, email }

  /** Até o momento, não importava o id do login,
   * só importava se era um ID válido, para ver se estava
   * autenticado.
   *
   * Entretanto, ao implementar AUTHORIZATION, o id faz
   * diferença para saber se o usuário está autorizado a
   * realizar a ação um determinado recurso.
   *
   * Por isso, no ambiente de teste a partir deste
   * momento, é necessário permitir fazer login explicitamente
   * deste os arquivos de teste.
   */
  const payload = {
    id: userId || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
    ip: '127.0.0.1',
  };

  // Generate JWT
  const token = jwt.sign(payload, global.JWS_VERIFY_SECRET, {
    algorithm: global.JWS_ALGORITHM,
    expiresIn: '5m',
  });

  // return a string thats the cookie with the encoded data
  return [`access_token=${token};`];
};
