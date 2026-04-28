const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

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
