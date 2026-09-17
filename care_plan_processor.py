import json

INPUT_FILE = "extracted_text.txt"
OUTPUT_FILE = "care_plan.json"


def process_discharge_text(text):
    care_plan = {
        "diagnosis": {
            "title": "",
            "explanation": ""
        },
        "treatment": {
            "summary": ""
        },
        "medications": [],
        "follow_up": {
            "when": "",
            "where": "",
            "doctor": "",
            "instructions": ""
        },
        "important_instructions": [],
        "warnings": [],
        "unclear_information": []
    }

    # Temporary structured extraction for testing.
    # Later this section will be replaced by Bedrock.

    text_lower = text.lower()

    # Diagnosis
    if "pubic diastasis" in text_lower:
        care_plan["diagnosis"] = {
            "title": "Pubic diastasis",
            "explanation": (
                "The report indicates separation or widening of the "
                "pubic bones in the front part of the pelvis."
            )
        }

    # Treatment
    if "pelvic" in text_lower and "traction" in text_lower:
        care_plan["treatment"]["summary"] = (
            "The condition was managed conservatively using pelvic traction."
        )

    # Medicines
    medications = [
        {
            "name": "Cefirime",
            "dose": "",
            "frequency": "",
            "route": "",
            "duration": "",
            "needs_confirmation": True
        },
        {
            "name": "Calcium",
            "dose": "",
            "frequency": "1 BD",
            "route": "",
            "duration": "7 days",
            "needs_confirmation": False
        },
        {
            "name": "Diclofenac",
            "dose": "",
            "frequency": "",
            "route": "",
            "duration": "7 days",
            "needs_confirmation": True
        },
        {
            "name": "Iron",
            "dose": "",
            "frequency": "",
            "route": "",
            "duration": "",
            "needs_confirmation": True
        },
        {
            "name": "Vitamin D3",
            "dose": "",
            "frequency": "Once weekly",
            "route": "",
            "duration": "",
            "needs_confirmation": False
        }
    ]

    care_plan["medications"] = medications

    # Follow-up
    care_plan["follow_up"] = {
        "when": "After 1 week",
        "where": "R.N. 18 / OPD",
        "doctor": "Dr. Ramesh Kumar",
        "instructions": "Return for review after approximately one week."
    }

    # Important instructions
    care_plan["important_instructions"] = [
        "Follow the treatment instructions provided by your doctor.",
        "Attend the scheduled follow-up after approximately one week.",
        "Confirm unclear medication details before taking them."
    ]

    # Safety
    care_plan["warnings"] = [
        "This summary is generated from the uploaded discharge report.",
        "It does not replace your doctor's instructions."
    ]

    # OCR uncertainty
    care_plan["unclear_information"] = [
        "Some medication names, doses and frequencies were not clearly readable in the report."
    ]

    return care_plan


def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as file:
        extracted_text = file.read()

    care_plan = process_discharge_text(extracted_text)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(care_plan, file, indent=4, ensure_ascii=False)

    print("\nCARE PLAN GENERATED SUCCESSFULLY\n")
    print(json.dumps(care_plan, indent=4, ensure_ascii=False))


if __name__ == "__main__":
    main()
