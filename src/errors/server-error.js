import { CustomError } from './custom-error';

export class ServerError extends CustomError {
  statusCode = 500;

  constructor(input, statusCode) {
    super(input);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ServerError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: this.message,
        field: this.field,
        value: this.value,
      },
    ];
  }
}
