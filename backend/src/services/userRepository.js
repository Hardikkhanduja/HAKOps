'use strict';

const {
  DynamoDBClient
} = require('@aws-sdk/client-dynamodb');

const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1'
});

const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'CareSetuUsers';

async function createUser(user) {
  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: user,
      ConditionExpression: 'attribute_not_exists(userId)'
    })
  );
}

async function getUserById(userId) {
  const result = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        userId
      }
    })
  );

  return result.Item || null;
}

async function getUserByEmail(email) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    })
  );

  return result.Items?.[0] || null;
}
async function getUserBySessionId(sessionId) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'sessionId-index',
      KeyConditionExpression: 'sessionId = :sessionId',
      ExpressionAttributeValues: {
        ':sessionId': sessionId
      }
    })
  );

  return result.Items?.[0] || null;
}

async function saveSessionId(userId, sessionId) {
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        userId
      },
      UpdateExpression: 'SET sessionId = :sessionId',
      ExpressionAttributeValues: {
        ':sessionId': sessionId
      }
    })
  );
}

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getUserBySessionId,
  saveSessionId
};
