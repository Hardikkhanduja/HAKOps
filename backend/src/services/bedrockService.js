/**
 * bedrockService.js — AI simplification + structuring via Amazon Bedrock.
 * Converts raw discharge text into the structured care plan shape.
 *
 * STUB — returns mock data so the full flow works today.
 * Kamal: replace the stub body with real Bedrock SDK calls (Claude/Titan).
 *        Install: @aws-sdk/client-bedrock-runtime
 *        Interface must stay identical.
 */
'use strict';

const mockData = require('../mocks/carePlan.mock.json');

/**
 * @param {string} rawText — output of textractService.extractText
 * @returns {Promise<object>} — { medications, followUps, dailyTasks, warningSigns, dietActivityRestrictions }
 */
async function simplifyAndStructure(rawText) {
  // TODO(Kamal): replace with real AWS SDK call
  // const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
  // const client = new BedrockRuntimeClient({ region: AWS_REGION });
  // const command = new InvokeModelCommand({
  //   modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
  //   contentType: 'application/json',
  //   body: JSON.stringify({ prompt: buildPrompt(rawText), max_tokens: 2000 }),
  // });
  // const response = await client.send(command);
  // return JSON.parse(new TextDecoder().decode(response.body));

  void rawText; // stub ignores raw text
  return { ...mockData.carePlan };
}

module.exports = { simplifyAndStructure };