/**
 * pipelineOrchestrator.js
 *
 * Application → Python AWS/AI pipeline bridge.
 *
 * Node owns the API/application flow.
 * Python owns the actual AWS + AI processing:
 * S3 → Textract → Gemini → Validator → Translate → DynamoDB
 */

'use strict';

const { spawn } = require('child_process');
const carePlanRepository = require('./carePlanRepository');

const PYTHON = '/home/ec2-user/discharge-companion-aws/venv/bin/python3';
const PIPELINE_DIR = '/home/ec2-user/discharge-companion-aws';

async function processDocument(id) {
  try {
    const record = await carePlanRepository.getRecord(id);

    if (!record) {
      console.error(`[Pipeline] Record not found: ${id}`);
      return;
    }

const language = record.preferredLanguage || record.language || 'en';
    console.log(
      `[Pipeline] Starting Python AWS pipeline: ${id} (lang: ${language})`
    );

    await runPythonPipeline(id, language);

    console.log(`[Pipeline] Python pipeline completed: ${id}`);

    // Python pipeline saves the final care plan to DynamoDB.
    // Node's repository is still being migrated to DynamoDB.
    await carePlanRepository.updateStatus(id, 'ready');

    console.log(`[Pipeline] Complete: ${id} — status: ready`);

  } catch (err) {
    console.error(`[Pipeline] Error for ${id}:`, err.message);

    try {
      await carePlanRepository.updateStatus(
        id,
        'error',
        err.message || 'Pipeline failed'
      );
    } catch (updateErr) {
      console.error(
        `[Pipeline] Could not write error status for ${id}:`,
        updateErr.message
      );
    }
  }
}

function runPythonPipeline(id, language) {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      DOCUMENT_ID: id,
      TARGET_LANGUAGE: language,
      GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
    };

    const child = spawn(
      PYTHON,
      ['pipeline.py'],
      {
        cwd: PIPELINE_DIR,
        env
      }
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(`[Python] ${output}`);
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(`[Python] ${output}`);
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(
          new Error(
            `Python pipeline exited with code ${code}: ${
              stderr.trim() || stdout.trim() || 'Unknown error'
            }`
          )
        );
      }
    });
  });
}

module.exports = { processDocument };
