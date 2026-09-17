/**
 * status.controller.js
 * Polled by the frontend StatusScreen every 3 seconds.
 * Returns 404 for unknown IDs so PlanLayout redirects to Upload.
 */
'use strict';

const carePlanRepository = require('../services/carePlanRepository');

async function getStatus(req, res, next) {
  try {
    const record = await carePlanRepository.getRecord(req.params.id);
    if (!record) {
      const err = new Error('Not found');
      err.isOperational = true;
      err.statusCode    = 404;
      return next(err);
    }
    res.status(200).json({ status: record.status });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStatus };