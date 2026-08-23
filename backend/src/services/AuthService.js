/**
 * Pulse AI — Auth Service (PostgreSQL)
 */

const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { User } = require("../models");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../lib/token");
const { ConflictError, UnauthorizedError, NotFoundError } = require("../lib/errors");

const SALT_ROUNDS = 12;

const AuthService = {
  async register({ email, password, name }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findByEmail(normalizedEmail);
    if (existing) throw new ConflictError("An account with this email already exists.");

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      id: uuidv4(),
      email: normalizedEmail,
      name: name?.trim() || null,
      password_hash: passwordHash,
    });

    const tokenPayload = { sub: user.id, email: user.email };
    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken: signAccessToken(tokenPayload),
      refreshToken: signRefreshToken(tokenPayload),
    };
  },

  async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findByEmail(normalizedEmail);
    if (!user) throw new UnauthorizedError("Invalid email or password.");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new UnauthorizedError("Invalid email or password.");

    const tokenPayload = { sub: user.id, email: user.email };
    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken: signAccessToken(tokenPayload),
      refreshToken: signRefreshToken(tokenPayload),
    };
  },

  refresh(token) {
    const payload = verifyRefreshToken(token);
    if (!payload) throw new UnauthorizedError("Invalid or expired refresh token.");

    const tokenPayload = { sub: payload.sub, email: payload.email };
    return {
      accessToken: signAccessToken(tokenPayload),
      refreshToken: signRefreshToken(tokenPayload),
    };
  },

  async getProfile(id) {
    const user = await User.findById(id);
    if (!user) throw new NotFoundError("User not found.");
    return { id: user.id, email: user.email, name: user.name, createdAt: user.created_at };
  },
};

module.exports = AuthService;
