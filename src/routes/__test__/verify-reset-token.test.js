import request from 'supertest';
import { server } from '../../server';

const generateToken = async () => {
  await request(server).post('/users').send({
    name: 'Robert',
    email: 'fake@email.com',
  });
  const response = await request(server)
    .post('/auth/password-reset')
    .send({ email: 'fake@email.com' });
  return response?.body?.token;
};

describe('Check password reset token', () => {
  test('Valid token', async () => {
    const token = await generateToken();

    const response = await request(server).get(`/auth/password-reset/${token}`);

    expect(response.status).toBe(204);
    expect(response.res.statusMessage).toBe('No Content');
  });

  test('Invalid token', async () => {
    const response = await request(server).get(`/auth/password-reset/123`);

    expect(response.status).toBe(404);
    expect(response.res.statusMessage).toBe('Not Found');
    expect(response.body.errors[0]).toEqual(
      expect.objectContaining({
        field: 'token',
        message: 'Token not found',
      })
    );
  });
});
