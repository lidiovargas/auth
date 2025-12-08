export class CustomError extends Error {
  statusCode;

  constructor(input) {
    let message, field, value;
    if (typeof input === 'string') {
      message = input;
    } else {
      ({ message, field, value } = input);
    }

    super(message);

    this.message = message;
    this.field = field;
    this.value = value;

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  serializeErrors([{ message, field, value }]) {}
}
