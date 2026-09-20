import boto3
import json

REGION = "ap-south-1"

INPUT_FILE = "gemini_care_plan.json"
OUTPUT_FILE = "translated_care_plan.json"

# User-selected language
# hi = Hindi
# te = Telugu
# ta = Tamil
# kn = Kannada
# ml = Malayalam
import os

TARGET_LANGUAGE = os.getenv("TARGET_LANGUAGE", "hi")

translate = boto3.client(
    "translate",
    region_name=REGION
)


def translate_text(text):

    if not text:
        return text

    # Preserve values that should never be translated
    if text == "Unclear":
        return text

    response = translate.translate_text(
        Text=text,
        SourceLanguageCode="en",
        TargetLanguageCode=TARGET_LANGUAGE
    )

    return response["TranslatedText"]


def translate_care_plan(care_plan):

    translated = json.loads(
        json.dumps(care_plan)
    )

    # -------------------------
    # Diagnosis
    # -------------------------

    translated["diagnosis"]["title"] = (
        translate_text(
            care_plan["diagnosis"]["title"]
        )
    )

    translated["diagnosis"]["explanation"] = (
        translate_text(
            care_plan["diagnosis"]["explanation"]
        )
    )

    # -------------------------
    # Treatment
    # -------------------------

    translated["treatment"]["summary"] = (
        translate_text(
            care_plan["treatment"]["summary"]
        )
    )

    # -------------------------
    # Medications
    # -------------------------

    for index, medication in enumerate(
        care_plan["medications"]
    ):

        # IMPORTANT:
        # Keep medication name exactly as extracted.
        translated["medications"][index]["name"] = (
            medication["name"]
        )

        # Medication instructions are preserved exactly as
        # extracted. Do not machine-translate or reinterpret
        # dosage/frequency/route/duration because OCR may contain
        # abbreviations such as "BD" or uncertain text.
        translated["medications"][index]["dose"] = (
            medication["dose"]
        )

        translated["medications"][index]["frequency"] = (
            medication["frequency"]
        )

        translated["medications"][index]["route"] = (
            medication["route"]
        )

        translated["medications"][index]["duration"] = (
            medication["duration"]
        )

        # Boolean remains unchanged
        translated["medications"][index][
            "needs_confirmation"
        ] = medication["needs_confirmation"]

    # -------------------------
    # Follow-up
    # -------------------------

    for field in [
        "when",
        "where",
        "doctor",
        "instructions"
    ]:

        translated["follow_up"][field] = (
            translate_text(
                care_plan["follow_up"][field]
            )
        )

    # -------------------------
    # Important instructions
    # -------------------------

    translated["important_instructions"] = [
        translate_text(item)
        for item in care_plan[
            "important_instructions"
        ]
    ]

    # -------------------------
    # Warnings
    # -------------------------

    translated["warnings"] = [
        translate_text(item)
        for item in care_plan["warnings"]
    ]
    # -------------------------
    # Unclear information
    # -------------------------
    #
    # Keep the original uncertainty
    # unchanged so OCR wording remains
    # traceable and is never altered
    # by machine translation.

    translated["unclear_information"] = (
        care_plan["unclear_information"]
    )
    return translated


def main():

    with open(
        INPUT_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        care_plan = json.load(file)

    print()
    print("================================")
    print("TRANSLATING CARE PLAN")
    print("================================")
    print(
        f"Target language: {TARGET_LANGUAGE}"
    )
    print()

    translated = translate_care_plan(
        care_plan
    )

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            translated,
            file,
            indent=4,
            ensure_ascii=False
        )

    print("Translation completed.")
    print(
        f"Saved to: {OUTPUT_FILE}"
    )

    print()
    print(
        json.dumps(
            translated,
            indent=4,
            ensure_ascii=False
        )
    )


if __name__ == "__main__":
    main()
