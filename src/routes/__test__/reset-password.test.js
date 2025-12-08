import request from 'supertest';
import { server } from '../../server';
import { PasswordResetToken } from '../../models/password-reset';

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

describe('Try password reset with token received by email', () => {
  test('Invalid input data in request', async () => {
    // Required
    let response = await request(server).patch('/auth/password-reset').send({});
    expect(response.status).toBe(400);
    expect(response.res.statusMessage).toBe('Bad Request');
    expect(response.body.errors[0]?.message).toBe(
      "must have required property 'token'"
    );
    expect(response.body.errors[1]?.message).toBe(
      "must have required property 'password'"
    );

    // Invalid type
    response = await request(server).patch('/auth/password-reset').send({
      token: 123,
      password: 567,
    });
    expect(response.status).toBe(400);
    expect(response.res.statusMessage).toBe('Bad Request');
    expect(response.body.errors[0]?.message).toBe('token must be string');
    expect(response.body.errors[1]?.message).toBe('password must be string');

    // Invalid length
    response = await request(server).patch('/auth/password-reset').send({
      token: 'asersasdag',
      password: 'asdf',
    });
    expect(response.status).toBe(400);
    expect(response.res.statusMessage).toBe('Bad Request');
    expect(response.body.errors[0]?.message).toBe(
      'token must NOT have fewer than 128 characters'
    );
    expect(response.body.errors[1]?.message).toBe(
      'password must NOT have fewer than 8 characters'
    );

    // Additional properties
    response = await request(server).patch('/auth/password-reset').send({
      token:
        '50e61891b74feb61315582f5300fb6ff34d1f41891546c1c563955cd3493f92ef16a47595950e54f63d12384f3d52c7ef1ad5f3ee60b44ce00424407648335af',
      password: 'asdwerqa322ssdaa',
      email: 'some@email.com',
    });
    expect(response.status).toBe(400);
    expect(response.res.statusMessage).toBe('Bad Request');
    expect(response.body.errors[0]?.message).toBe(
      'must NOT have additional properties'
    );
  });

  test('Token not found in database', async () => {
    const response = await request(server).patch('/auth/password-reset').send({
      token:
        '50e61891b74feb61315582f5300fb6ff34d1f41891546c1c563955cd3493f92ef16a47595950e54f63d12384f3d52c7ef1ad5f3ee60b44ce00424407648335af',
      password: 'somepassword',
    });

    expect(response.status).toBe(404);
    expect(response.res.statusMessage).toBe('Not Found');
    expect(response.body).toEqual(
      expect.objectContaining({
        errors: [
          {
            field: 'token',
            message: 'Token not found',
          },
        ],
      })
    );
  });

  test('Successfully update password', async () => {
    const token = await generateToken();
    const password = 'somePa$sword820';

    const response = await request(server).patch('/auth/password-reset').send({
      token: token,
      password,
    });

    expect(response.status).toBe(204);
    expect(response.res.statusMessage).toBe('No Content');
    expect(response.body).toEqual({});

    const result = await PasswordResetToken.find({ token });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
