'use strict';

const carePlanRepository = require('../services/carePlanRepository');
const s3Service = require('../services/s3Service');

async function getCarePlan(req, res, next) {
  try {
    const { id } = req.params;
    const record = await carePlanRepository.getRecord(id);

    if (!record) {
      const err = new Error('Not found');
      err.isOperational = true;
      err.statusCode = 404;
      return next(err);
    }

    if (record.status !== 'ready') {
      return res.status(200).json({
        status: record.status
      });
    }

    const presignedUrl =
      await s3Service.getPresignedDownloadUrl(id);

    const carePlan = record.carePlan || {};

    res.status(200).json({
      patient: {
        name: record.patientName || 'Patient',
        preferredLanguage:
          record.preferredLanguage || record.language || 'en'
      },

      originalDocument: {
        url: presignedUrl,
        uploadedAt: record.uploadedAt
      },

      carePlan: {
        medications: carePlan.medications || [],

        followUps: carePlan.follow_up
          ? [carePlan.follow_up]
          : [],

        dailyTasks: carePlan.important_instructions || [],

        warningSigns: carePlan.warnings || [],

        dietActivityRestrictions: []
      },

      reminders: record.reminders || [],

      status: record.status
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCarePlan };
