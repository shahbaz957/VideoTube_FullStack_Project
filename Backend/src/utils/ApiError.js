class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something Went Wrong",
    errors = [],
    stack
  ) {
    super(message) // for overwriting the message field
    this.message = message,
    this.data = null,
    this.errors = errors,
    this.statusCode = statusCode,
    this.success = false

    if(stack) { 
        this.stack = stack // for tracing the stack and reaching the original error
    }else{
        Error.captureStackTrace(this , this.constructor)
    }
  }
}

export {ApiError}
