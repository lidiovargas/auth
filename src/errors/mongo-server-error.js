import { CustomError } from './custom-error';
import util from 'util';

/**
 * Tipo: MongoServerError
 *
 * Campos:
 * - stack
 * - message: string
 * - index: 0
 * - code: 11000
 * - keyPattern: { isoCode: 1}
 * - keyValue: { isoCode: 'BRL' }
 * - Symbol(errorLabels)
 * - name
 * - errmsg
 * - errorLabels
 *
 * Lista de erros: https://github.com/mongodb/mongo/blob/master/src/mongo/base/error_codes.yml
 *
 */

export class MongoServerError extends CustomError {
  statusCode = 409; // Conflict

  constructor(errors) {
    super('Database error');
    this.errors = errors;

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, MongoServerError.prototype);
  }

  serializeErrors() {
    // console.log('in mongoServerError.js/serializeErrors');
    // console.error(util.inspect(this.errors, { showHidden: true, depth: null }));

    const { message, code, name, keyValue } = this.errors;

    const prop = Object.keys(keyValue)[0];
    const value = Object.values(keyValue)[0];

    let customMsg = message;
    if (code === 11000)
      customMsg = `DuplicatedKey error in field '${prop}' with value '${value}'`;

    return [
      {
        message: customMsg,
        prop,
        value,
        statusCode: 409,
        mongoCode: code,
        mongoName: name,
        mongoMsg: message,
      },
    ];
  }
}
