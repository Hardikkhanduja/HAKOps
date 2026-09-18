/**
 * s3Service.js — Amazon S3 presigned URL generation.
 * Hardik owns this file fully — pure AWS SDK plumbing, not AI pipeline work.
 *
 * S3 key convention: "documents/{id}" for both upload and download.
 * Presigned URLs expire in 900 seconds (15 minutes).
 *
 * LOCAL DEV MODE: when S3_BUCKET is the default "caresetu-documents-dev"
 * and no real AWS credentials exist, stub URLs are returned so the full
 * flow can be tested end-to-end without an AWS account.
 * Set S3_BUCKET to a real bucket name to switch to real presigned URLs.
 *
 * WHY presigned upload URLs:
 * A 20 MB file through API Gateway/Lambda hits the ~10 MB payload ceiling.
 * Presigned direct-to-S3 PUT avoids that entirely.
 *
 * WHY presigned download URLs:
 * Private S3 objects return AccessDenied XML without a presigned URL —
 * that is exactly the bug that was showing in DocumentView.
 *
 * Kamal: configure S3 bucket CORS to allow PUT from the frontend origin.
 */
'use strict';

const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl }                                  = require('@aws-sdk/s3-request-presigner');
const { S3_BUCKET, AWS_REGION }                         = require('../config/env');

const EXPIRY_SECONDS   = 900;         // 15 minutes
const DEV_BUCKET       = 'caresetu-documents-dev'; // default = local dev

const IS_LOCAL_DEV = S3_BUCKET === DEV_BUCKET;

// Only instantiate the real S3 client when not in local dev mode
const s3Client = IS_LOCAL_DEV ? null : new S3Client({ region: AWS_REGION });

/**
 * Generates a presigned S3 PUT URL for direct browser-to-S3 upload.
 * Returns a stub URL in local dev (when S3_BUCKET is the default dev value).
 * @param {string} id       — Record UUID
 * @param {string} fileName — Original filename (informational)
 * @param {string} fileType — MIME type e.g. "application/pdf"
 * @returns {Promise<string>}
 */
async function getPresignedUploadUrl(id, fileName, fileType) {
  if (IS_LOCAL_DEV) {
    // Stub: return a local echo URL so the frontend PUT goes to /dev/upload/:id
    // which the real server accepts and discards (no actual S3 write in dev).
    return `http://localhost:${process.env.PORT || 4000}/dev/upload/${id}`;
  }
const command = new PutObjectCommand({
  Bucket: S3_BUCKET,
  Key: `documents/${id}`,
});
  return getSignedUrl(s3Client, command, { expiresIn: EXPIRY_SECONDS });
}

/**
 * Generates a presigned S3 GET URL for reading the stored document.
 * Returns the public W3C sample PDF in local dev so DocumentView renders.
 * @param {string} id — Record UUID
 * @returns {Promise<string>}
 */
async function getPresignedDownloadUrl(id) {
  if (IS_LOCAL_DEV) {
    // Stub: return a real publicly accessible PDF for DocumentView demo
    return 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf';
  }
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key:    `documents/${id}`,
  });
  return getSignedUrl(s3Client, command, { expiresIn: EXPIRY_SECONDS });
}

module.exports = { getPresignedUploadUrl, getPresignedDownloadUrl };
