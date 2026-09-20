'use strict';

const { randomUUID } = require('crypto');

const {
  SchedulerClient,
  CreateScheduleCommand
} = require('@aws-sdk/client-scheduler');

const carePlanRepository = require('../services/carePlanRepository');

const scheduler = new SchedulerClient({
  region: process.env.AWS_REGION || 'ap-south-1'
});

const SCHEDULER_ROLE_ARN =
  process.env.SCHEDULER_ROLE_ARN ||
  'arn:aws:iam::689324611366:role/CareSetu-Scheduler-ExecutionRole';

const REMINDER_LAMBDA_ARN =
  process.env.REMINDER_LAMBDA_ARN ||
  'arn:aws:lambda:ap-south-1:689324611366:function:CareSetu-ReminderWorker';

async function createReminder(req, res, next) {
  try {
    const {
      patientId,
      dateTime,
      subject,
      message
    } = req.body;

    const userId = req.user.userId;
    const email = req.user.email;

    if (!patientId) {
      return res.status(400).json({
        error: 'patientId is required'
      });
    }

    if (!dateTime) {
      return res.status(400).json({
        error: 'dateTime is required'
      });
    }

    // Make sure this care plan belongs to the authenticated user.
    const record = await carePlanRepository.getRecord(patientId);

    if (!record) {
      return res.status(404).json({
        error: 'Care plan not found'
      });
    }

    if (record.userId !== userId) {
      return res.status(403).json({
        error: 'Not authorized for this care plan.'
      });
    }

    const reminderDate = new Date(dateTime);

    if (Number.isNaN(reminderDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid dateTime'
      });
    }

    if (reminderDate.getTime() <= Date.now()) {
      return res.status(400).json({
        error: 'Reminder dateTime must be in the future'
      });
    }

    const reminder = {
      reminderId: randomUUID(),
      email,
      dateTime: reminderDate.toISOString(),
      subject: subject || 'CareSetu Reminder',
      message: message || 'This is your CareSetu reminder.',
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    const scheduleName = `CareSetu-${reminder.reminderId}`;

    await scheduler.send(
      new CreateScheduleCommand({
        Name: scheduleName,
        ScheduleExpression: `at(${reminderDate.toISOString().replace(/\.\d{3}Z$/, '')})`,
        ScheduleExpressionTimezone: 'UTC',
        FlexibleTimeWindow: {
          Mode: 'OFF'
        },
        Target: {
          Arn: REMINDER_LAMBDA_ARN,
          RoleArn: SCHEDULER_ROLE_ARN,
          Input: JSON.stringify({
            recipient: email,
            subject: reminder.subject,
            message: reminder.message
          })
        }
      })
    );

    await carePlanRepository.addReminder(patientId, reminder);

    res.status(201).json({
      message: 'Reminder saved',
      reminder
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReminder
};
