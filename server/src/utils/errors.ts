export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details: Record<string, string[]> | null = null
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function validationError(details: Record<string, string[]>) {
  return new AppError(400, 'VALIDATION_ERROR', 'Validation failed', details);
}

export function unauthorizedError(message = 'Unauthorized') {
  return new AppError(401, 'UNAUTHORIZED', message);
}

export function forbiddenError(message = 'Forbidden') {
  return new AppError(403, 'FORBIDDEN', message);
}

export function notFoundError(message = 'Resource not found') {
  return new AppError(404, 'NOT_FOUND', message);
}

export function conflictError(message = 'Conflict') {
  return new AppError(409, 'CONFLICT', message);
}
