'use strict';

const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const userRepository = require('../services/userRepository');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'name, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await userRepository.getUserByEmail(
      normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      userId: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    await userRepository.createUser(user);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'email and password are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userRepository.getUserByEmail(
      normalizedEmail
    );

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }
const sessionId = randomUUID();

await userRepository.saveSessionId(user.userId, sessionId);

    res.status(200).json({
      message: 'Login successful',
      sessionId,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login
};
