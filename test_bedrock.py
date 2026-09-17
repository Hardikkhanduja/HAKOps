from ai_providers.bedrock import BedrockProvider


def main():

    with open("extracted_text.txt", "r", encoding="utf-8") as file:
        extracted_text = file.read()

    print("\nTesting Bedrock provider...")
    print("Sending OCR text to Bedrock...\n")

    try:
        provider = BedrockProvider()

        result = provider.process_discharge(extracted_text)

        print("\nBEDROCK RESPONSE:\n")

        print(result)

    except Exception as e:

        print("\nBEDROCK ERROR:")
        print(type(e).__name__)
        print(str(e))


if __name__ == "__main__":
    main()
