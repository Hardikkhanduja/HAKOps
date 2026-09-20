'use strict';

const express = require('express');
const reminderController = require('../controllers/reminder.controller');
const { requireSession } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', requireSession, reminderController.createReminder);

module.exports = router;
