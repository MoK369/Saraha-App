function asyncHandler(fn) {
  return async (req, res, next) => {
    await fn(req, res, next).catch((error) => {
      next(error);
    });
  };
}
export default asyncHandler;
