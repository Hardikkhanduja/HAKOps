'use strict';

const userRepository = require('../services/userRepository');

async function requireSession(req, res, next) {
  try {
    const sessionId = req.headers['x-session-id'];

    if (!sessionId) {
      return res.status(401).json({
        error: 'Authentication required. Please log in.'
      });
    }

    const user = await userRepository.getUserBySessionId(sessionId);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid or expired session. Please log in again.'
      });
    }

    req.user = user;
    req.sessionId = sessionId;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  requireSession
};
