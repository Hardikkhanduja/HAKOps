'use strict';
const { Router }  = require('express');
const { initUpload, confirmUpload } = require('../controllers/upload.controller');
const router = Router();
router.post('/init',    initUpload);    // Step 1: validate + presigned PUT URL
router.post('/confirm', confirmUpload); // Step 2: trigger pipeline + return { id, status }
module.exports = router;