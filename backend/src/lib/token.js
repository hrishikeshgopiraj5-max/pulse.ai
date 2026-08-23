/**
 * Pulse AI — JWT Token Utilities
 *
 * Generates and verifies access & refresh tokens.
 */

const jwt = require("jsonwebtoken");
const config = require("../config");

/**
 * @param {Object} payload - { sub, email, ... }
 * @returns {string}
 */
function signAccessToken(payload) {
  return jwt.sign(
    { ...payload, type: "access" },
    config.JWT_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRES }
  );
}

/**
 * @param {Object} payload - { sub, email, ... }
 * @returns {string}
 */
function signRefreshToken(payload) {
  return jwt.sign(
    { ...payload, type: "refresh" },
    config.JWT_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES }
  );
}

/**
 * @param {string} token
 * @returns {Object|null}
 */
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.type !== "access") return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * @param {string} token
 * @returns {Object|null}
 */
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.type !== "refresh") return null;
    return decoded;
  } catch {
    return null;
  }
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
