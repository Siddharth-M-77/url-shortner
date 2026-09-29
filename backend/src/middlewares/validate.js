import { AppError } from "../utils/AppError.js";

// Validates req.body against a zod schema and replaces it with the parsed result
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const first = result.error.issues[0];
    const field = first.path.join(".");
    throw new AppError(field ? `${field}: ${first.message}` : first.message, 400);
  }
  req.body = result.data;
  next();
};
