export class AppError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = "AppError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
