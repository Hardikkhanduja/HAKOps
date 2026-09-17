/**
 * carePlanRepository.js — Data access layer for care plan records.
 *
 * CURRENT: In-memory Map — works without any AWS credentials.
 * Kamal: replace each TODO block with real DynamoDB SDK calls.
 *        Use @aws-sdk/lib-dynamodb. Table name from config/env.js.
 *        Function signatures must stay identical.
 *
 * DynamoDB record shape (for Kamal's schema design):
 *   PK: id (String), status, preferredLanguage, uploadedAt,
 *       patientName, carePlan (Map), errorMessage (String, optional)
 */
'use strict';

// In-memory store — Kamal replaces with DynamoDB
const store = new Map();

/**
 * Creates a new care plan record.
 * @param {string} id
 * @param {{ preferredLanguage: string, status: string, uploadedAt: string }} data
 */
async function createRecord(id, { preferredLanguage, status, uploadedAt }) {
  // TODO(Kamal): replace with real AWS SDK call
  // const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
  // await ddbDocClient.send(new PutCommand({
  //   TableName: DYNAMODB_TABLE,
  //   Item: { id, preferredLanguage, status, uploadedAt },
  //   ConditionExpression: 'attribute_not_exists(id)',
  // }));
  store.set(id, { id, preferredLanguage, status, uploadedAt,
                  patientName: null, carePlan: null, reminders: [], errorMessage: null });
}

/**
 * Updates the status (and optionally error message) of a record.
 * @param {string} id
 * @param {string} status — "uploading"|"processing"|"ready"|"error"
 * @param {string} [errorMessage]
 */
async function updateStatus(id, status, errorMessage) {
  // TODO(Kamal): replace with real AWS SDK call
  // await ddbDocClient.send(new UpdateCommand({
  //   TableName: DYNAMODB_TABLE,
  //   Key: { id },
  //   UpdateExpression: 'SET #s = :s, errorMessage = :e',
  //   ExpressionAttributeNames: { '#s': 'status' },
  //   ExpressionAttributeValues: { ':s': status, ':e': errorMessage || null },
  // }));
  const record = store.get(id);
  if (record) {
    record.status = status;
    if (errorMessage !== undefined) record.errorMessage = errorMessage;
  }
}

/**
 * Saves the processed care plan and patient name to the record.
 * @param {string} id
 * @param {{ patientName: string, carePlan: object }} data
 */
async function saveCarePlan(id, { patientName, carePlan }) {
  // TODO(Kamal): replace with real AWS SDK call
  // await ddbDocClient.send(new UpdateCommand({
  //   TableName: DYNAMODB_TABLE,
  //   Key: { id },
  //   UpdateExpression: 'SET patientName = :n, carePlan = :c',
  //   ExpressionAttributeValues: { ':n': patientName, ':c': carePlan },
  // }));
  const record = store.get(id);
  if (record) {
    record.patientName = patientName;
    record.carePlan    = carePlan;
  }
}

/**
 * Retrieves a full care plan record by ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function getRecord(id) {
  // TODO(Kamal): replace with real AWS SDK call
  // const { GetCommand } = require('@aws-sdk/lib-dynamodb');
  // const result = await ddbDocClient.send(new GetCommand({
  //   TableName: DYNAMODB_TABLE,
  //   Key: { id },
  // }));
  // return result.Item || null;
  return store.get(id) || null;
}

module.exports = { createRecord, updateStatus, saveCarePlan, getRecord };