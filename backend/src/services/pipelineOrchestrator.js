/**
 * pipelineOrchestrator.js — AI pipeline orchestration.
 * Hardik owns this file fully — it is glue code, not AI work.
 *
 * Flow: getRecord → extractText → simplifyAndStructure → translate
 *       → saveCarePlan → updateStatus("ready")
 *
 * CRITICAL CONTRACT:
 * - This function ALWAYS resolves (never rejects).
 * - On any error: writes status "error" to the repository and returns.
 * - This guarantees the frontend's 120-second status poller always gets
 *   a terminal state ("ready" or "error") and never polls indefinitely.
 *
 * Called fire-and-forget from confirmUpload (no await on the call site).
 * The HTTP 200 response is sent before this function completes.
 */
'use strict';

const textractService    = require('./textractService');
const bedrockService     = require('./bedrockService');
const translateService   = require('./translateService');
const carePlanRepository = require('./carePlanRepository');

/**
 * Runs the full document processing pipeline for a care plan record.
 * Always resolves — never rejects.
 * @param {string} id — Care plan record UUID
 * @returns {Promise<void>}
 */
async function processDocument(id) {
  try {
    // Load record to get preferred language
    const record = await carePlanRepository.getRecord(id);
    if (!record) {
      console.error(`[Pipeline] Record not found: ${id}`);
      return;
    }

    const s3Key = `documents/${id}`;
    console.log(`[Pipeline] Starting: ${id} (lang: ${record.preferredLanguage})`);

    // Step 1: OCR — extract raw text from the uploaded document
    const rawText = await textractService.extractText(s3Key);
    console.log(`[Pipeline] Textract done: ${id} (${rawText.length} chars)`);

    // Step 2: AI — convert raw text to structured care plan
    const carePlanShape = await bedrockService.simplifyAndStructure(rawText);
    console.log(`[Pipeline] Bedrock done: ${id}`);

    // Step 3: Translate — convert strings to patient's preferred language
    const translated = await translateService.translate(carePlanShape, record.preferredLanguage);
    console.log(`[Pipeline] Translate done: ${id}`);

    // Step 4: Persist
    // patientName default: Kamal will extract this from Textract/Bedrock output
    const patientName = record.patientName || 'Patient';
    await carePlanRepository.saveCarePlan(id, { patientName, carePlan: translated });
    await carePlanRepository.updateStatus(id, 'ready');

    console.log(`[Pipeline] Complete: ${id} — status: ready`);

  } catch (err) {
    // Always write error — never leave record stuck in "processing"
    console.error(`[Pipeline] Error for ${id}:`, err.message);
    try {
      await carePlanRepository.updateStatus(id, 'error', err.message || 'Pipeline failed');
    } catch (updateErr) {
      console.error(`[Pipeline] Could not write error status for ${id}:`, updateErr.message);
    }
    // Do NOT re-throw — the HTTP 200 was already sent
  }
}

module.exports = { processDocument };