// import { ValidationError } from "express-validator";
import { CustomError } from './custom-error';

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(errors) {
    super('Invalid request parameters');
    this.errors = errors;

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((err) => {
      // ajv errors output before serialization
      // console.dir(err, { depth: 4 });

      const instancePath = err.instancePath.replace(/^\//g, '');
      const message = `${instancePath} ${err.message}`.trim();
      let prop = instancePath;
      let value = err.data;

      if (err.keyword === 'additionalProperties') {
        prop = err.params.additionalProperty;
        value = err.data[prop];
      }

      if (err.keyword === 'required') {
        prop = err.params.missingProperty;
        value = '';
      }

      return {
        message,
        value,
        prop,
        path: err.schemaPath,
        keyword: err.keyword,
        params: err.params,
      };
    });
  }
}
