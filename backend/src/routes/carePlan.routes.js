'use strict';
const { Router }   = require('express');
const { getCarePlan } = require('../controllers/carePlan.controller');
const router = Router();
router.get('/care-plan/:id', getCarePlan);
module.exports = router;