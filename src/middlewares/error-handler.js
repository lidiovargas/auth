import { CustomError } from '@lidiovargas/errors';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  console.error(err.stack);
  res.status(400).send({
    errors: [{ message: 'Something went wrong' }],
  });
};
