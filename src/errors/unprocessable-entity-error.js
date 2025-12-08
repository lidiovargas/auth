import { CustomError } from './custom-error';

export class UnprocessableEntityError extends CustomError {
  statusCode = 422;

  constructor(message = 'Unprocessable Entity') {
    message = message === '' ? 'Unprocessable Entity' : message;
    super(message);

    Object.setPrototypeOf(this, UnprocessableEntityError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
