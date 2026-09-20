/**
 * carePlanRepository.js
 *
 * DynamoDB data access layer.
 *
 * Uses the existing DischargeCarePlans table.
 * DynamoDB partition key: patientId
 *
 * For this MVP:
 * Hardik's application id == patientId
 * Kamal's Python pipeline uses DOCUMENT_ID == patientId
 */

'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand
} = require('@aws-sdk/lib-dynamodb');

const {
  DYNAMODB_TABLE,
  AWS_REGION
} = require('../config/env');

const client = new DynamoDBClient({
  region: AWS_REGION
});

const ddb = DynamoDBDocumentClient.from(client);

/**
 * Creates a new care plan record.
 */
async function createRecord(
  id,
  { preferredLanguage, status, uploadedAt, sessionId, userId, patientName }
) {
  await ddb.send(
    new PutCommand({
      TableName: DYNAMODB_TABLE,

      Item: {
        patientId: id,
        documentId: id,
sessionId: sessionId || null,
        language: preferredLanguage,
        preferredLanguage,
        status,
        reviewStatus: 'PENDING',
        uploadedAt,
        patientName: patientName || null,
        carePlan: null,
        reminders: [],
        errorMessage: null
      },

      ConditionExpression: 'attribute_not_exists(patientId)'
    })
  );
}

/**
 * Updates the status of a record.
 */
async function updateStatus(id, status, errorMessage) {
  const values = {
    ':status': status
  };

  let updateExpression =
    'SET #status = :status';

  const names = {
    '#status': 'status'
  };

  if (errorMessage !== undefined) {
    updateExpression += ', errorMessage = :errorMessage';
    values[':errorMessage'] = errorMessage || null;
  }

  await ddb.send(
    new UpdateCommand({
      TableName: DYNAMODB_TABLE,

      Key: {
        patientId: id
      },

      UpdateExpression: updateExpression,

      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values
    })
  );
}

/**
 * Saves the processed care plan and patient name.
 */
async function saveCarePlan(
  id,
  { patientName, carePlan }
) {
  await ddb.send(
    new UpdateCommand({
      TableName: DYNAMODB_TABLE,

      Key: {
        patientId: id
      },

      UpdateExpression:
        'SET patientName = :patientName, carePlan = :carePlan',

      ExpressionAttributeValues: {
        ':patientName': patientName || 'Patient',
        ':carePlan': carePlan
      }
    })
  );
}

/**
 * Retrieves a full care plan record.
 */
async function getRecord(id) {
  const result = await ddb.send(
    new GetCommand({
      TableName: DYNAMODB_TABLE,

      Key: {
        patientId: id
      }
    })
  );

  return result.Item || null;
}


/**
 * Adds a reminder to an existing care plan record.
 */
async function addReminder(id, reminder) {
  await ddb.send(
    new UpdateCommand({
      TableName: DYNAMODB_TABLE,
      Key: {
        patientId: id
      },
      UpdateExpression:
        'SET reminders = list_append(if_not_exists(reminders, :emptyList), :reminder)',
      ExpressionAttributeValues: {
        ':emptyList': [],
        ':reminder': [reminder]
      }
    })
  );
}

/**
 * Replaces the reminders array for an existing care plan record.
 */
async function saveReminders(id, reminders) {
  await ddb.send(
    new UpdateCommand({
      TableName: DYNAMODB_TABLE,
      Key: {
        patientId: id
      },
      UpdateExpression: 'SET reminders = :reminders',
      ExpressionAttributeValues: {
        ':reminders': reminders
      }
    })
  );
}

module.exports = {
  createRecord,
  updateStatus,
  saveCarePlan,
  getRecord,
  addReminder,
  saveReminders
};
