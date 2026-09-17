import boto3
import json

from ai_providers.base import AIProvider


class BedrockProvider(AIProvider):

    def __init__(self, region="ap-south-1"):
        self.region = region

        self.client = boto3.client(
            "bedrock-runtime",
            region_name=self.region
        )

        self.model_id = "qwen.qwen3-235b-a22b-2507-v1:0"

    def process_discharge(self, extracted_text: str) -> dict:

        prompt = f"""
You are a medical discharge document structuring assistant.

Convert the following OCR text from a hospital discharge summary
into a clear, patient-friendly care plan.

STRICT RULES:

1. Use ONLY information present in the document.
2. NEVER invent medical information.
3. NEVER create a diagnosis that is not explicitly present.
4. NEVER guess unclear medication names, doses, frequencies,
   routes, or durations.
5. If information is unclear because of OCR quality,
   preserve the original unclear text and set
   needs_confirmation to true.
6. Do not provide new treatment recommendations.
7. Do not change the doctor's instructions.
8. Simplify medical terminology for the patient.
9. Include ALL diagnosis information.
10. Include ALL medications.
11. Include follow-up information.
12. Include important instructions and warnings.
13. Return ONLY valid JSON.
14. Do not use Markdown.

Return exactly this structure:

{{
    "diagnosis": {{
        "title": "",
        "explanation": ""
    }},
    "treatment": {{
        "summary": ""
    }},
    "medications": [
        {{
            "name": "",
            "dose": "",
            "frequency": "",
            "route": "",
            "duration": "",
            "needs_confirmation": false
        }}
    ],
    "follow_up": {{
        "when": "",
        "where": "",
        "doctor": "",
        "instructions": ""
    }},
    "important_instructions": [],
    "warnings": [],
    "unclear_information": []
}}

OCR DOCUMENT:

--- BEGIN DOCUMENT ---

{extracted_text}

--- END DOCUMENT ---
"""

        request_body = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "max_tokens": 3000,
            "temperature": 0.1
        }

        response = self.client.invoke_model(
            modelId=self.model_id,
            body=json.dumps(request_body),
            contentType="application/json",
            accept="application/json"
        )

        response_body = json.loads(
            response["body"].read()
        )

        return response_body
