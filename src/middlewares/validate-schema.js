import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import fs from 'fs';
import path from 'path';
import { RequestValidationError } from '../errors/request-validation-error';
import { BadRequestError } from '../errors/bad-request-error';

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
  strictUnionTypes: false,
  verbose: true,
  $data: true, // Habilita referências entre campos
});
addFormats(ajv);

// O caminho deve levar até a pasta 'src' da sua biblioteca
const libSchemaDir = path.resolve(
  process.cwd(),
  'node_modules/@lidiovargas/schemas/src'
);

export const validateSchema = (schemaName) => {
  // Monta o caminho absoluto do arquivo:
  // Ex: /app/node_modules/@lidiovargas/schemas/src/contracts/auth/login.request.schema.json
  const schemaFullPath = path.resolve(libSchemaDir, schemaName);

  return async (req, res, next) => {
    try {
      // Verificação rápida se o arquivo existe (opcional, mas bom para debug)
      if (!fs.existsSync(schemaFullPath)) {
        console.error(`❌ Schema file not found at: ${schemaFullPath}`);
        return next(new BadRequestError(`Schema not found: ${schemaName}`));
      }

      // --- PULO DO GATO ---
      // Passamos o CAMINHO do arquivo, não o objeto.
      // O $RefParser lê o arquivo e usa o diretório dele como base para resolver os "../definitions"
      const schemaBundled = await $RefParser.dereference(schemaFullPath);

      const valid = ajv.validate(schemaBundled, req.body);
      // console.dir(schemaBundled, { depth: 6 });

      if (!valid) {
        return next(new RequestValidationError(ajv.errors));
      }

      next();
    } catch (err) {
      console.error(`Error processing schema ${schemaName}:`, err);
      return next(new BadRequestError('Schema validation error'));
    }
  };
};
