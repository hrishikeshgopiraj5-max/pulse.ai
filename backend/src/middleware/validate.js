/**
 * Pulse AI — Validation Middleware
 *
 * Factory that creates middleware from a schema's validate() function.
 */

const { ValidationError } = require("../lib/errors");

/**
 * @param {{ validate: (body: any) => string | null }} schema
 */
function validate(schema) {
  return (req, res, next) => {
    const error = schema.validate(req.body);
    if (error) {
      return next(new ValidationError(error));
    }
    next();
  };
}

module.exports = { validate };
