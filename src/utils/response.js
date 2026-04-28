/**
 * Standardized API response helpers
 * All controllers use these to ensure a consistent response shape.
 */

/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {*} data - Response data payload
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 500)
 */
const errorResponse = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

/**
 * Send a paginated list response
 * @param {object} res - Express response object
 * @param {Array} rows - Array of records
 * @param {number} total - Total count of records (for all pages)
 * @param {number} page - Current page number
 * @param {number} limit - Records per page
 * @param {string} message - Success message
 */
const paginatedResponse = (res, rows, total, page, limit, message = 'Fetched successfully') => {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    message,
    data: rows,
    pagination: {
      total,
      totalPages,
      currentPage: Number(page),
      perPage: Number(limit),
      hasNextPage: Number(page) < totalPages,
      hasPrevPage: Number(page) > 1,
    },
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
