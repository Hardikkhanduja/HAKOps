'use strict';

const express = require('express');
const { createSession } = require('../controllers/session.controller');

const router = express.Router();

router.post('/', createSession);

module.exports = router;
