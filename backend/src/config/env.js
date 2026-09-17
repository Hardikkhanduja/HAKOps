/**
 * config/env.js — CareSetu backend environment configuration.
 *
 * All AWS resource names and runtime settings come from process.env.
 * Kamal: set these in your Lambda function environment variables.
 * Never hard-code values in service files — always import from here.
 */
'use strict';

module.exports = {
  S3_BUCKET:      process.env.S3_BUCKET      || 'caresetu-documents-dev',
  DYNAMODB_TABLE: process.env.DYNAMODB_TABLE  || 'caresetu-care-plans-dev',
  AWS_REGION:     process.env.AWS_REGION      || 'ap-south-1',
  PORT:           process.env.PORT            || 4000,
};