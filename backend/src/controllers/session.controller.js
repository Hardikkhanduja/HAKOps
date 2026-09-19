'use strict';

const { randomUUID } = require('crypto');

function createSession(req, res) {
  const sessionId = randomUUID();

  res.status(201).json({
    sessionId
  });
}

module.exports = {
  createSession
};
