import { errorResponse } from '../utils/response.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const dataToValidate = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return errorResponse(res, 'Validation failed', 400, formattedErrors, 'VALIDATION_ERROR');
    }

    if (source === 'body') req.body = result.data;
    if (source === 'query') req.query = result.data;
    if (source === 'params') req.params = result.data;

    next();
  };
}
