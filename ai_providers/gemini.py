import os
import json

from google import genai

from ai_providers.base import AIProvider


class GeminiProvider(AIProvider):

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured")

        self.client = genai.Client(api_key=api_key)

        # Model can be changed without modifying this file.
        # Example:
        # export GEMINI_MODEL="gemini-3.5-flash-lite"
        self.model_id = os.getenv(
            "GEMINI_MODEL",
            "gemini-3.6-flash"
        )

    def process_discharge(self, extracted_text: str) -> dict:

        prompt = f"""
You are a document-structuring assistant for a hospital
discharge companion application.

Your task is to convert OCR text from a hospital discharge
summary into a structured, patient-friendly care plan.

IMPORTANT:
The original discharge document is the source of truth.
You must NOT add medical information that is not explicitly
present in the document.

========================
CRITICAL SAFETY RULES
========================

1. Use ONLY information explicitly present in the OCR document.

2. NEVER invent, assume, infer, autocomplete, or hallucinate
   medical information.

3. NEVER guess an unclear medication name.

   Example:
   If OCR says:
       "cafirime"

   Output:
       "cafirime"

   DO NOT output:
       "Cefixime"
       "possibly Cefixime"
       or any other guessed medicine.

4. NEVER infer a medication route.

   If the route is not explicitly stated:
       "route": "Unclear"

5. NEVER infer a medication dose.

   If the dose is not clearly present:
       "dose": "Unclear"

6. NEVER infer medication frequency.

   If frequency is not clearly present:
       "frequency": "Unclear"

7. NEVER infer medication duration.

   If duration is not clearly present:
       "duration": "Unclear"

8. If ANY medication information is uncertain,
   set:

       "needs_confirmation": true

9. Preserve unclear OCR wording instead of correcting it
   using medical knowledge.

10. NEVER infer a diagnosis.

    Only include diagnoses explicitly stated in the document.

11. You MAY explain an explicitly stated diagnosis in simpler
    language for the patient.

12. The simplified explanation must NOT introduce a new
    diagnosis, treatment, symptom, or medical claim.

13. You MAY simplify medical terminology for readability,
    but preserve the original meaning.

14. Include ALL relevant diagnosis information found
    in the document.

15. Include ALL medications found in the document.

16. Include follow-up information found in the document.

17. Include important restrictions and instructions found
    in the document.

18. NEVER create warning signs that are not present
    in the document.

19. NEVER provide new treatment recommendations.

20. NEVER recommend medicines, dosages, exercises,
    diets, procedures, or treatments that are not explicitly
    present in the document.

21. NEVER change the doctor's instructions.

22. If information is unclear because of OCR quality,
    preserve the readable OCR text and mark it as requiring
    confirmation.

23. Do not remove important information simply because
    it is difficult to understand.

24. Return ONLY valid JSON.

25. Do NOT return Markdown.

26. Do NOT return explanations outside the JSON.

========================
FIELD RULES
========================

Use:

"Unclear"

when a value cannot be reliably determined.

Use an empty string only when the field genuinely does not
apply or the information is completely absent.

For medications:

- name must remain faithful to the OCR.
- dose must come from the document.
- frequency must come from the document.
- route must come from the document.
- duration must come from the document.
- do not use medical knowledge to fill missing values.

========================
OUTPUT FORMAT
========================

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

========================
OCR DOCUMENT
========================

--- BEGIN DOCUMENT ---

{extracted_text}

--- END DOCUMENT ---

Now convert the OCR document into the required JSON
structure while following every safety rule above.
"""

        response = self.client.models.generate_content(
            model=self.model_id,
            contents=prompt,
            config={
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
        )

        if not response.text:
            raise RuntimeError(
                "Gemini returned an empty response"
            )

        try:
            care_plan = json.loads(response.text)

        except json.JSONDecodeError as e:
            raise RuntimeError(
                f"Gemini returned invalid JSON: {e}"
            )

        return care_plan
