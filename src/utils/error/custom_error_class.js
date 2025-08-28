export class CustomError extends Error {
  constructor(message, statusCode=400) {
    super(message); // Call the parent constructor with the message
    this.name = "CustomError"; // Set the error name (optional but recommended)
    this.statusCode = statusCode;
  }
}