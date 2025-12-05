module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send({
    success: false,
    message: err?.message || "internal server error",
    errors: err?.errors || [],
    data: null,
  });
};
