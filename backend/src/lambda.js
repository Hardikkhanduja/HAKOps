/**
 * lambda.js — AWS Lambda entry point.
 * @vendia/serverless-express adapts API Gateway events into Express req/res.
 * Same app.js handles requests identically locally and on Lambda.
 * Lambda handler config: src/lambda.handler
 */
'use strict';

const serverlessExpress = require('@vendia/serverless-express');
const app = require('./app');

exports.handler = serverlessExpress({ app });