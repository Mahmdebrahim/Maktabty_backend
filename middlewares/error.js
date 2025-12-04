module.exports = class errorMiddleWare {
  // ** error global handling middleware
 static handle(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const status = err.status;
    res.status(statusCode).send({
      errors: {
        statusCode: statusCode,
        status: status,
        message: err?.message || `internal server error`,
        errors: err?.errors || [],
      },
    });
    next();
  }
}
