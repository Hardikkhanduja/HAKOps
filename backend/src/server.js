/**
 * server.js — Local development entry point.
 * Run: node src/server.js
 * For frontend-only dev, keep using mockServer.js on :4000.
 */
'use strict';

const app          = require('./app');
const { PORT }     = require('./config/env');

app.listen(PORT, () => {
  console.log(`CareSetu real backend running on http://localhost:${PORT}`);
  console.log(`  POST /api/upload/init`);
  console.log(`  POST /api/upload/confirm`);
  console.log(`  GET  /api/status/:id`);
  console.log(`  GET  /api/care-plan/:id`);
});