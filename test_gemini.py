from ai_providers.gemini import GeminiProvider
import json
import sys


def main():

    with open("extracted_text.txt", "r", encoding="utf-8") as file:
        extracted_text = file.read()

    print("\n========================================")
    print(" Testing Gemini Discharge Processor")
    print("========================================\n")

    try:
        provider = GeminiProvider()

        print("Sending OCR text to Gemini...\n")

        care_plan = provider.process_discharge(extracted_text)

        print("AI CARE PLAN:\n")
        print(
            json.dumps(
                care_plan,
                indent=4,
                ensure_ascii=False
            )
        )

        with open(
            "gemini_care_plan.json",
            "w",
            encoding="utf-8"
        ) as file:
            json.dump(
                care_plan,
                file,
                indent=4,
                ensure_ascii=False
            )

        print("\n========================================")
        print("SUCCESS")
        print("Saved to: gemini_care_plan.json")
        print("========================================")

    except Exception as e:
        print("\n========================================")
        print("GEMINI ERROR")
        print("========================================")
        print(type(e).__name__)
        print(str(e))
        sys.exit(1)


if __name__ == "__main__":
    main()
