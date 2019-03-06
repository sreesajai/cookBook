module.exports = {
  badRequest(message = 'Bad Request') {
    const error = new Error();
    error.statusCode = 400;
    error.name = 'Bad Request';
    error.message = message;
    delete error.stack;
    return error;
  },
  unauthorized(message = 'You are not authorized to perform this request') {
    const error = new Error();
    error.statusCode = 401;
    error.name = 'Unauthorized';
    error.message = message;
    delete error.stack;
    return error;
  },
  internalError(message = 'Internal Server Error') {
    const error = new Error();
    error.statusCode = 500;
    error.name = message;
    error.message = message;
    delete error.stack;
    return error;
  }
};