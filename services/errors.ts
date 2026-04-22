class ServiceError extends Error {
  constructor(message = 'Account not found') {
    super(message);
    this.name = 'AccountNotFoundError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
    };
  }
}

export class AccountNotFoundError extends ServiceError {
  constructor(message = 'Account not found') {
    super(message);
    this.name = 'AccountNotFoundError';
  }
}

export class InvalidOtpError extends ServiceError {
  constructor(message = 'Invalid OTP code') {
    super(message);
    this.name = 'InvalidOtpError';
  }
}

export class OtpAlreadyExpiredError extends ServiceError {
  constructor(message = 'Expired OTP code') {
    super(message);
    this.name = 'OtpAlreadyExpiredError';
  }
}

export class InvalidFaceEmbeddingVectorError extends ServiceError {
  constructor(message = 'Invalid face embedding vector') {
    super(message);
    this.name = 'InvalidFaceEmbeddingVectorError';
  }
}

export class IncorrectPasswordError extends ServiceError {
  constructor(message = 'Incorrect password') {
    super(message);
    this.name = 'IncorrectPasswordError';
  }
}

export class EmailAddressNotAvailableError extends ServiceError {
  constructor(message = 'Email address is already in use') {
    super(message);
    this.name = 'EmailAddressNotAvailableError';
  }
}

export class MobileNumberNotAvailableError extends ServiceError {
  constructor(message = 'Mobile number is already in use') {
    super(message);
    this.name = 'MobileNumberNotAvailableError';
  }
}

export function isServiceError(
  error: unknown,
): error is
  | AccountNotFoundError
  | InvalidOtpError
  | OtpAlreadyExpiredError
  | InvalidFaceEmbeddingVectorError
  | IncorrectPasswordError
  | EmailAddressNotAvailableError
  | MobileNumberNotAvailableError {
  return (
    error instanceof AccountNotFoundError ||
    error instanceof InvalidOtpError ||
    error instanceof OtpAlreadyExpiredError ||
    error instanceof InvalidFaceEmbeddingVectorError ||
    error instanceof IncorrectPasswordError ||
    error instanceof EmailAddressNotAvailableError ||
    error instanceof MobileNumberNotAvailableError
  );
}
