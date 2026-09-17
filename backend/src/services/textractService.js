/**
 * textractService.js — OCR: extracts raw text from a discharge document in S3.
 *
 * STUB — returns representative text so the pipeline works end-to-end today.
 * Kamal: replace the stub body with real Amazon Textract SDK calls.
 *        Install: @aws-sdk/client-textract
 *        Interface must stay identical.
 */
'use strict';

/**
 * @param {string} s3Key — e.g. "documents/{id}"
 * @returns {Promise<string>} — extracted text
 */
async function extractText(s3Key) {
  // TODO(Kamal): replace with real AWS SDK call
  // const { TextractClient, StartDocumentTextDetectionCommand,
  //         GetDocumentTextDetectionCommand } = require('@aws-sdk/client-textract');
  // const client = new TextractClient({ region: AWS_REGION });
  // ... start job, poll until complete, join all LINE blocks into a string

  void s3Key; // stub ignores the key
  return [
    'DISCHARGE SUMMARY',
    'Patient: Sample Patient',
    'Medications: Amoxicillin 500mg every 8 hours for 5 days; ' +
      'Paracetamol 650mg as needed for fever max 3 times a day',
    'Follow-up: Appointment with Dr. Sharma on September 22 2026; ' +
      'Blood test CBC on September 20 2026',
    'Daily Tasks: Change wound dressing once daily; Monitor temperature twice daily',
    'Warning Signs: Fever above 101F; Increased redness or swelling at incision site; ' +
      'Difficulty breathing',
    'Diet and Activity: No heavy lifting for 2 weeks; Soft food diet for first 3 days',
  ].join('\n');
}

module.exports = { extractText };