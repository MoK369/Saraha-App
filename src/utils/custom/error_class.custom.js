 class CustomError extends Error {
  constructor(message, statusCode=400) {
    super(message);
    this.name = "CustomError";
    this.statusCode = Number(statusCode);
  }
}

export default CustomError;