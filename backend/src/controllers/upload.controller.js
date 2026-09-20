/**
 * upload.controller.js — Two-step presigned upload flow.
 *
 * Step 1: initUpload   → validate + create DB record + return presigned PUT URL
 * Step 2: confirmUpload → verify session + trigger pipeline + return { id, status }
 *
 * WHY two steps?
 * A 20 MB file going through API Gateway/Lambda hits the ~10 MB payload ceiling.
 * Presigned direct-to-S3 upload avoids this — only small JSON payloads go
 * through Lambda. Standard AWS pattern for large file uploads.
 *
 * Kamal note: the pipeline trigger is confirmUpload (POST body), NOT an S3 event.
 * You can add an S3-event trigger later without changing the frontend.
 */

'use strict';

const { v4: uuidv4 } = require('uuid');
const carePlanRepository = require('../services/carePlanRepository');
const s3Service = require('../services/s3Service');
const pipelineOrchestrator = require('../services/pipelineOrchestrator');

const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const ALLOWED_LANGUAGES = new Set([
  'en',
  'hi',
  'pa',
  'kn',
  'ml',
  'ta',
  'te',
]);

function operationalError(message, statusCode = 400) {
  const err = new Error(message);
  err.isOperational = true;
  err.statusCode = statusCode;
  return err;
}

/**
 * POST /api/upload/init
 *
 * Body:
 * {
 *   fileName,
 *   fileType,
 *   preferredLanguage
 * }
 *
 * Header:
 * X-Session-Id: <anonymous-session-id>
 *
 * Returns:
 * {
 *   id,
 *   uploadUrl
 * }
 */
async function initUpload(req, res, next) {
  try {
    const {
      fileName,
      fileType,
      preferredLanguage,
    } = req.body;

    // Anonymous session ID created by the frontend.
    const sessionId = req.sessionId;
    const userId = req.user.userId;
    const userName = req.user.name;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing session ID',
      });
    }

    if (
      !fileName ||
      typeof fileName !== 'string' ||
      !fileName.trim()
    ) {
      return next(
        operationalError(
          'fileName is required and must be a non-empty string.'
        )
      );
    }

    if (!fileType) {
      return next(
        operationalError('fileType is required.')
      );
    }

    if (!ALLOWED_FILE_TYPES.has(fileType)) {
      return next(
        operationalError(
          `fileType must be one of: application/pdf, image/jpeg, image/png, image/webp. Got: "${fileType}"`
        )
      );
    }

    if (!preferredLanguage) {
      return next(
        operationalError('preferredLanguage is required.')
      );
    }

    if (!ALLOWED_LANGUAGES.has(preferredLanguage)) {
      return next(
        operationalError(
          `preferredLanguage must be one of: en, hi, pa, kn, ml, ta, te. Got: "${preferredLanguage}"`
        )
      );
    }

    const id = uuidv4();
    const uploadedAt = new Date().toISOString();

    // Create the upload record and associate it with this session.
    await carePlanRepository.createRecord(id, {
      preferredLanguage,
      status: 'uploading',
      uploadedAt,
      sessionId,
      userId,
      patientName: userName,
    });

    const uploadUrl =
      await s3Service.getPresignedUploadUrl(
        id,
        fileName,
        fileType
      );

    console.log(
      `[Upload] Init: ${id} (${fileType}, ${preferredLanguage}, session=${sessionId})`
    );

    res.status(200).json({
      id,
      uploadUrl,
    });

  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/upload/confirm
 *
 * Body:
 * {
 *   id
 * }
 *
 * Header:
 * X-Session-Id: <anonymous-session-id>
 *
 * Returns:
 * {
 *   id,
 *   status: "processing"
 * }
 *
 * The pipeline is triggered fire-and-forget.
 */
async function confirmUpload(req, res, next) {
  try {
    const { id } = req.body;

    const sessionId = req.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing session ID',
      });
    }

    if (!id) {
      return next(
        operationalError('id is required.')
      );
    }

    const record =
      await carePlanRepository.getRecord(id);

    if (!record) {
      return next(
        operationalError('Not found', 404)
      );
    }

    // Make sure this upload belongs to the current session.
    if (record.sessionId !== sessionId) {
      return next(
        operationalError(
          'Not authorized for this upload.',
          403
        )
      );
    }

    await carePlanRepository.updateStatus(
      id,
      'processing'
    );

    // Fire-and-forget — do NOT await.
    // pipelineOrchestrator always resolves and handles
    // pipeline errors internally.
    pipelineOrchestrator.processDocument(id);

    console.log(
      `[Upload] Confirm: ${id} — pipeline started`
    );

    res.status(200).json({
      id,
      status: 'processing',
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  initUpload,
  confirmUpload,
};
