import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { RequestValidationError } from '../errors/request-validation-error';

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
  strictUnionTypes: false,
  verbose: true,
});
addFormats(ajv);

// Cria uma função de middleware personalizada que valida o corpo da solicitação com base no esquema JSON
function validateBody(schema) {
  let mainSchema, rest;
  if (Array.isArray(schema)) {
    [mainSchema, ...rest] = schema;

    for (const mySchema of rest) {
      if (!ajv.getSchema(mySchema['$id'])) {
        ajv.addSchema(mySchema);
      }
    }
  } else {
    mainSchema = schema;
  }

  if (!ajv.getSchema(mainSchema['$id'])) {
    ajv.addSchema(mainSchema);
  }

  return function (req, res, next) {
    const valid = ajv.validate(mainSchema['$id'], req.body);

    if (!valid) {
      throw new RequestValidationError(ajv.errors);
    }

    next();
  };
}

export { validateBody };
