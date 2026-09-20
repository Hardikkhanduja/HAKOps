'use strict';

const carePlanRepository = require('../services/carePlanRepository');
const s3Service = require('../services/s3Service');

function normalizeFollowUp(followUp) {
  if (!followUp || typeof followUp !== 'object') {
    return null;
  }

  return {
    date: followUp.date || null,
    description:
      followUp.description ||
      followUp.instructions ||
      followUp.when ||
      'Follow-up',
    type: followUp.type || 'follow-up',
    when: followUp.when || '',
    where: followUp.where || '',
    doctor: followUp.doctor || '',
    instructions: followUp.instructions || ''
  };
}

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

    // Make sure the care plan belongs to the authenticated user.
    if (record.userId !== req.user.userId) {
      const err = new Error('Not authorized for this care plan.');
      err.isOperational = true;
      err.statusCode = 403;
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

    const followUps = [];

    if (Array.isArray(carePlan.followUps)) {
      for (const followUp of carePlan.followUps) {
        const normalized = normalizeFollowUp(followUp);

        if (normalized) {
          followUps.push(normalized);
        }
      }
    } else if (carePlan.follow_up) {
      const normalized = normalizeFollowUp(carePlan.follow_up);

      if (normalized) {
        followUps.push(normalized);
      }
    }

    const dailyTasks = Array.isArray(carePlan.dailyTasks)
      ? carePlan.dailyTasks
      : Array.isArray(carePlan.important_instructions)
        ? carePlan.important_instructions.map((item) => ({
            description: item,
            frequency: 'As instructed'
          }))
        : [];

    const warningSigns = Array.isArray(carePlan.warningSigns)
      ? carePlan.warningSigns
      : Array.isArray(carePlan.warnings)
        ? carePlan.warnings
        : [];

    res.status(200).json({
      patient: {
        name: record.patientName || 'Patient',
        preferredLanguage:
          record.preferredLanguage ||
          record.language ||
          'en'
      },

      originalDocument: {
        url: presignedUrl,
        uploadedAt: record.uploadedAt
      },

      carePlan: {
        diagnosis: carePlan.diagnosis || {
          title: '',
          explanation: ''
        },

        treatment: carePlan.treatment || {
          summary: ''
        },

        medications: Array.isArray(carePlan.medications)
          ? carePlan.medications
          : [],

        followUps,

        dailyTasks,

        warningSigns,

        dietActivityRestrictions:
          Array.isArray(carePlan.dietActivityRestrictions)
            ? carePlan.dietActivityRestrictions
            : [],

        unclearInformation:
          Array.isArray(carePlan.unclear_information)
            ? carePlan.unclear_information
            : []
      },

      reminders: Array.isArray(record.reminders)
        ? record.reminders
        : [],

      status: record.status
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCarePlan };
