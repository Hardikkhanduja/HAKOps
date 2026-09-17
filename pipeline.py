import os
import json
import subprocess
import sys


def run_step(step_name, command):
    print("\n" + "=" * 50)
    print(step_name)
    print("=" * 50)

    result = subprocess.run(command, capture_output=True, text=True)

    print(result.stdout)

    if result.returncode != 0:
        print(result.stderr)
        raise RuntimeError(f"{step_name} failed")

    print(f"✅ {step_name} completed")


def main():

    print("\n")
    print("=" * 50)
    print("DISCHARGE COMPANION PIPELINE")
    print("=" * 50)

    target_language = os.getenv("TARGET_LANGUAGE", "hi")

    print(f"Target language: {target_language}")

    # 1. Textract
    run_step(
        "STEP 1/5 — OCR WITH TEXTRACT",
        [sys.executable, "textract_text.py"]
    )

    # 2. Gemini
    run_step(
        "STEP 2/5 — GENERATE CARE PLAN WITH GEMINI",
        [sys.executable, "test_gemini.py"]
    )

    # 3. Validate
    run_step(
        "STEP 3/5 — VALIDATE CARE PLAN",
        [sys.executable, "care_plan_validator.py"]
    )

    # 4. Translate
    run_step(
        "STEP 4/5 — TRANSLATE CARE PLAN",
        [sys.executable, "translate_care_plan.py"]
    )

    # 5. Save to DynamoDB
    run_step(
        "STEP 5/5 — SAVE CARE PLAN TO DYNAMODB",
        [sys.executable, "save_care_plan.py"]
    )

    print("\n")
    print("=" * 50)
    print("🎉 PIPELINE COMPLETED SUCCESSFULLY")
    print("=" * 50)

    print(f"\nLanguage: {target_language}")
    print("S3 → Textract → Gemini → Validator → Translate → DynamoDB")


if __name__ == "__main__":
    main()
