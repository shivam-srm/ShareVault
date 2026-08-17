// Zod validation middleware for request body / params / query.
// Usage: router.post('/x', validate({ body: schema }), handler)
export const validate = (schemas = {}) => (req, res, next) => {
  try {
    if (schemas.body)   req.body   = schemas.body.parse(req.body);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.query)  req.query  = schemas.query.parse(req.query);
    return next();
  } catch (err) {
    const message = err?.issues?.[0]?.message || "Invalid request";
    return res.status(400).json({ message });
  }
};
