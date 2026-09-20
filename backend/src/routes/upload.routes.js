'use strict';

const { Router } = require('express');

const {
  initUpload,
  confirmUpload
} = require('../controllers/upload.controller');

const { requireSession } = require('../middleware/auth.middleware');

const router = Router();

router.post('/init', requireSession, initUpload);
router.post('/confirm', requireSession, confirmUpload);

module.exports = router;
