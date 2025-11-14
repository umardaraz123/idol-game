// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    error = {
      message,
      statusCode: 400,
      type: 'ValidationError'
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    
    error = {
      message,
      statusCode: 409,
      type: 'DuplicateError',
      field
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400,
      type: 'ValidationError',
      errors: Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {})
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid authentication token',
      statusCode: 401,
      type: 'AuthenticationError'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Authentication token has expired',
      statusCode: 401,
      type: 'AuthenticationError'
    };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File size too large',
      statusCode: 413,
      type: 'FileUploadError'
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Unexpected field in file upload',
      statusCode: 400,
      type: 'FileUploadError'
    };
  }

  // Cloudinary errors
  if (err.http_code) {
    error = {
      message: err.message || 'Cloudinary upload failed',
      statusCode: err.http_code >= 400 && err.http_code < 500 ? 400 : 500,
      type: 'CloudinaryError'
    };
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError') {
    error = {
      message: 'Database connection failed',
      statusCode: 503,
      type: 'DatabaseError'
    };
  }

  // Rate limiting errors
  if (err.status === 429) {
    error = {
      message: 'Too many requests, please try again later',
      statusCode: 429,
      type: 'RateLimitError'
    };
  }

  // Default error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  const errorResponse = {
    success: false,
    error: {
      message,
      type: error.type || 'ServerError',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    }
  };

  // Add field-specific errors for validation
  if (error.errors) {
    errorResponse.error.validationErrors = error.errors;
  }

  // Add field name for duplicate errors
  if (error.field) {
    errorResponse.error.field = error.field;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler for undefined routes
export const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

// Async wrapper to catch async errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};