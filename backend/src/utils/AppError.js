// Operational error with an HTTP status; caught and formatted by errorHandler
export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
    this.isOperational = true;
  }
}
