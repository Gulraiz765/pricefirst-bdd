const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

const schemas = {
  offer: {
    type: "object",
    required: ["buyerName", "price", "currency"],
    properties: {
      buyerName: { type: "string" },
      price: { type: "number", minimum: 0 },
      currency: { type: "string" },
      isTopOffer: { type: "boolean" }
    }
  }
};

function validate(schemaName, data) {
  const schema = schemas[schemaName];
  if (!schema) {
    return { valid: false, errors: [`Schema '${schemaName}' not found`] };
  }
  const validateFn = ajv.compile(schema);
  const valid = validateFn(data);
  return { valid, errors: validateFn.errors || [] };
}

function validateArray(schemaName, dataArray) {
  if (!Array.isArray(dataArray)) {
    return { valid: false, errors: ['Data is not an array'] };
  }
  const results = dataArray.map(item => validate(schemaName, item));
  const valid = results.every(r => r.valid);
  const errors = results.filter(r => !r.valid).flatMap(r => r.errors);
  return { valid, errors };
}

module.exports = { validate, validateArray };
