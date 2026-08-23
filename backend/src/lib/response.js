/**
 * Pulse AI — Response Helpers
 *
 * Standardized JSON response shapes across the entire API.
 * Every endpoint uses these to guarantee consistency.
 */

/**
 * @param {string} message
 * @param {Object} [data]
 * @param {number} [statusCode]
 */
function success(message, data = {}, statusCode = 200) {
  return {
    success: true,
    message,
    data,
    meta: { timestamp: new Date().toISOString() },
  };
}

/**
 * @param {string} detail
 * @param {Object} [meta]
 */
function error(detail, meta = {}) {
  return {
    success: false,
    detail,
    meta: { timestamp: new Date().toISOString(), ...meta },
  };
}

/**
 * @param {string} message
 * @param {Object} data
 * @param {Object} pagination
 */
function paginated(message, data, pagination) {
  return {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      pagination,
    },
  };
}

module.exports = { success, error, paginated };
