// All expected types of errors
class BadRequestError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

class UnauthorizedError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class NotFoundError extends Error {
  status = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export default {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
};
