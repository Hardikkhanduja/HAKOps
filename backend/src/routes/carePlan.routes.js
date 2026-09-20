'use strict';
const { Router }   = require('express');
const { getCarePlan } = require('../controllers/carePlan.controller');
const { requireSession } = require('../middleware/auth.middleware');
const router = Router();
router.get('/care-plan/:id', requireSession, getCarePlan);
module.exports = router;