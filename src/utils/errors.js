class BadRequestError extends Error {
  constructor(message, code = "E400") {
    super();
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BadRequestError);
    }

    this.errorCode = 400;
    this.intCode = code;
    this.errors = {
      property: "Invalid Credentials",
      message:
        message ||
        "An invalid parameter was supplied with request, please supply appropraite params",
    };
  }
}

class ServerError extends Error {
  constructor(message) {
    super();
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServerError);
    }

    this.errorCode = 500;
    this.intCode = "E500";
    this.errors = {
      message: message || "Something went wrong, please try again",
    };
  }
}

class NotFoundError extends Error {
  constructor(message, code = "E404") {
    super();
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }

    this.errorCode = 404;
    this.intCode = code;
    this.errors = {
      message: message || "Could Not Find Resource",
    };
  }
}

class UnAuthorizedAccess extends Error {
  constructor(message, code = "E401") {
    super();
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnAuthorizedAccess);
    }

    this.errorCode = 401;
    this.intCode = code;
    this.errors = {
      message:
        message ||
        "You do not have sufficient permission to access this resource",
    };
  }
}

const ErrorHandler = (error) => {
  if (error.name === "MongoError" && error.code === 11000) {
    return {
      errorCode: 400,
      message: `${Object.keys(error.keyValue)[0]} already exists`,
    };
  }

  if (error.name === "ValidationError") {
    const message = [];
    for (const key in error.errors) {
      if (error.errors.hasOwnProperty(key)) {
        const err = error.errors[key];
        message.push(`${key} failed as ${err.kind}`);
      }
    }
    return {
      errorCode: 400,
      message,
    };
  }

  if (error.name === "CastError") {
    return {
      errorCode: 400,
      message: error.message,
    };
  }

  if (!error.errorCode || !error.intCode) {
    return {
      errorCode: 500,
      intCode: 500,
      message: "Something went wrong, try again later",
    };
  }

  return {
    errorCode: error.errorCode,
    intCode: error.intCode,
    message: error.errors.message,
  };
};

module.exports = {
  BadRequestError,
  ServerError,
  UnAuthorizedAccess,
  NotFoundError,
  ErrorHandler,
};
