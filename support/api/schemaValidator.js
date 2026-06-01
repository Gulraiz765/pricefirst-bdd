// support/api/schemaValidator.js
// Validates API response bodies against JSON schemas from fixtures/api/api.fixtures.json
// Uses Ajv (already available via npm) for fast, detailed validation errors.

const Ajv = require('ajv');
const fixtures = require('../../fixtures/api/api.fixtures.json');

const ajv = new Ajv({ allErrors: true });

/**
 * Validate data against a named schema from api.fixtures.json
 * @param {string} schemaName  - key from fixtures.schemas  e.g. 'offer'
 * @param {object} data        - the response body to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validate(schemaName, data) {
  const schema = fixtures.schemas[schemaName];
  if (!schema) throw new Error(`Schema "${schemaName}" not found in api.fixtures.json`);

  const isValid = ajv.validate(schema, data);
  const errors  = isValid ? [] : (ajv.errors || []).map(e => `${e.instancePath} ${e.message}`);
  return { valid: isValid, errors };
}

/**
 * Validate every item in an array against a named schema.
 * Returns the first failure, or { valid: true } if all pass.
 */
function validateArray(schemaName, items) {
  for (let i = 0; i < items.length; i++) {
    const result = validate(schemaName, items[i]);
    if (!result.valid) {
      return { valid: false, errors: [`Item [${i}]: ${result.errors.join(', ')}`] };
    }
  }
  return { valid: true, errors: [] };
}

module.exports = { validate, validateArray };