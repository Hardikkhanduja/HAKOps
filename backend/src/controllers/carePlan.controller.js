/**
 * carePlan.controller.js — Returns the full care plan per API_CONTRACT.md.
 *
 * Key rules:
 * - originalDocument.url is ALWAYS a fresh presigned GET URL (never a raw bucket URL).
 *   Raw bucket URLs cause "AccessDenied" XML to appear in DocumentView.
 * - reviewRequired: true on medications is NEVER suppressed or coerced.
 * - If status !== "ready", returns { status } only — no care plan data yet.
 * - 404 for unknown IDs.
 */
'use strict';

const carePlanRepository = require('../services/carePlanRepository');
const s3Service          = require('../services/s3Service');

async function getCarePlan(req, res, next) {
  try {
    const { id } = req.params;
    const record  = await carePlanRepository.getRecord(id);

    if (!record) {
      const err = new Error('Not found');
      err.isOperational = true;
      err.statusCode    = 404;
      return next(err);
    }

    // Care plan not ready yet — return just the status
    if (record.status !== 'ready') {
      return res.status(200).json({ status: record.status });
    }

    // Generate a FRESH presigned GET URL every time.
    // NEVER return a raw S3 URL — private objects return AccessDenied XML.
    const presignedUrl = await s3Service.getPresignedDownloadUrl(id);

    // Shape response exactly per docs/API_CONTRACT.md
    res.status(200).json({
      patient: {
        name:              record.patientName || 'Patient',
        preferredLanguage: record.preferredLanguage,
      },
      originalDocument: {
        url:        presignedUrl,       // presigned HTTPS, 15 min expiry
        uploadedAt: record.uploadedAt,
      },
      carePlan: {
        // reviewRequired is passed through as-is — NEVER modified.
        medications:              (record.carePlan && record.carePlan.medications)              || [],
        followUps:                (record.carePlan && record.carePlan.followUps)                || [],
        dailyTasks:               (record.carePlan && record.carePlan.dailyTasks)               || [],
        warningSigns:             (record.carePlan && record.carePlan.warningSigns)             || [],
        dietActivityRestrictions: (record.carePlan && record.carePlan.dietActivityRestrictions) || [],
      },
      reminders: record.reminders || [],
      status:    record.status,
    });

  } catch (err) {
    next(err);
  }
}

module.exports = { getCarePlan };