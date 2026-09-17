/**
 * translateService.js — Translates care plan strings via Amazon Translate.
 *
 * STUB — identity pass-through (returns input unchanged).
 * For "en" this is correct in production too; for other languages Kamal integrates.
 * Kamal: replace the stub body with real Amazon Translate SDK calls.
 *        Install: @aws-sdk/client-translate
 *        Interface must stay identical.
 */
'use strict';

/**
 * @param {object} carePlanShape — output of bedrockService.simplifyAndStructure
 * @param {string} targetLanguageCode — "en"|"hi"|"pa"|"kn"|"ml"|"ta"|"te"
 * @returns {Promise<object>} — same shape with strings translated
 */
async function translate(carePlanShape, targetLanguageCode) {
  // TODO(Kamal): replace with real AWS SDK call
  // const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');
  // const client = new TranslateClient({ region: AWS_REGION });
  // Translate each string field (medication names, descriptions, etc.):
  // const result = await client.send(new TranslateTextCommand({
  //   Text: textField,
  //   SourceLanguageCode: 'en',
  //   TargetLanguageCode: targetLanguageCode,
  // }));

  void targetLanguageCode; // stub ignores target language
  return carePlanShape;    // identity pass-through
}

module.exports = { translate };