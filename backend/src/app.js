/**
 * app.js — CareSetu Express application (no listen).
 * Consumed by server.js (local dev) and lambda.js (AWS Lambda).
 * Hardik owns: routes, controllers, middleware, orchestration.
 * Kamal owns:  service implementations (textract, bedrock, translate, dynamodb).
 */
'use strict';

const express      = require('express');
const cors         = require('cors');
const uploadRoutes   = require('./routes/upload.routes');
const statusRoutes   = require('./routes/status.routes');
const carePlanRoutes = require('./routes/carePlan.routes');
const sessionRoutes   = require('./routes/session.routes');
const errorHandler   = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

// Dev-only echo endpoint — accepts the PUT that the frontend sends to the
// "presigned URL" when running against the local dev stub (no real S3).
// In production, the frontend PUTs directly to S3; this route is never hit.
if (process.env.S3_BUCKET === 'caresetu-documents-dev' || !process.env.S3_BUCKET) {
  app.put('/dev/upload/:id', (req, res) => {
    console.log(`[DevUpload] Received file for record: ${req.params.id}`);
    res.status(200).send('OK');
  });
}

app.use('/api/upload', uploadRoutes);
app.use('/api',        statusRoutes);
app.use('/api',        carePlanRoutes);
app.use('/api/session', sessionRoutes);

// Central error handler — MUST be last
app.use(errorHandler);

module.exports = app;