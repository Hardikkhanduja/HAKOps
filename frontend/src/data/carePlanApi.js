/**
 * carePlanApi.js — All backend calls go through here.
 *
 * BASE_URL points to /api which Vite proxies to :4000 (mock or real backend).
 * When Kamal deploys the real backend, only BASE_URL needs to change.
 *
 * uploadDischargeDocument uses a three-step presigned S3 flow:
 *   1. POST /api/upload/init       → { id, uploadUrl }
 *   2. PUT file directly to S3     (bypasses Lambda 10 MB payload ceiling)
 *   3. POST /api/upload/confirm    → { id, status: "processing" }
 *
 * Exported signature is IDENTICAL to the original — no component changes needed.
 * Kamal: configure S3 bucket CORS to allow PUT from the frontend origin.
 */
const BASE_URL = '/api';

/**
 * Uploads a discharge document and kicks off the pipeline.
 * @param {File} file
 * @param {string} preferredLanguage — e.g. "en", "hi"
 * @returns {Promise<{ id: string, status: string }>}
 */
export async function uploadDischargeDocument(file, preferredLanguage) {
  // Step 1: init — get a presigned S3 PUT URL from the backend
  const initRes = await fetch(`${BASE_URL}/upload/init`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      fileName:          file.name,
      fileType:          file.type,
      preferredLanguage,
    }),
  });
  if (!initRes.ok) {
    const body = await initRes.json().catch(() => ({}));
    throw new Error(body.error || 'Upload initialisation failed. Please try again.');
  }
  const { id, uploadUrl } = await initRes.json();

  // Step 2: PUT file directly to S3 — bypasses API Gateway payload limit
  // Kamal: the S3 bucket CORS policy must allow PUT from the frontend origin.
  const s3Res = await fetch(uploadUrl, {
    method:  'PUT',
    headers: { 'Content-Type': file.type },
    body:    file,
  });
  if (!s3Res.ok) {
    throw new Error(
      'File upload to storage failed. Please check your connection and try again.'
    );
  }

  // Step 3: confirm — tell the backend the file is in S3, trigger pipeline
  const confirmRes = await fetch(`${BASE_URL}/upload/confirm`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ id }),
  });
  if (!confirmRes.ok) {
    const body = await confirmRes.json().catch(() => ({}));
    throw new Error(body.error || 'Upload confirmation failed. Please try again.');
  }

  return confirmRes.json(); // { id, status: "processing" }
}

/**
 * Polls processing status. Called by StatusScreen every 3 seconds.
 * @param {string} id
 * @returns {Promise<{ status: string }>}
 */
export async function getProcessingStatus(id) {
  const res = await fetch(`${BASE_URL}/status/${id}`);
  if (!res.ok) throw new Error('Status check failed');
  return res.json();
}

/**
 * Fetches the full care plan. Called once by PlanLayout on mount.
 * @param {string} id
 * @returns {Promise<object>} — full care plan per docs/API_CONTRACT.md
 */
export async function getCarePlan(id) {
  const res = await fetch(`${BASE_URL}/care-plan/${id}`);
  if (!res.ok) throw new Error('Failed to fetch care plan');
  return res.json();
}