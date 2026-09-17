import boto3

REGION = "ap-south-1"

translate = boto3.client(
    "translate",
    region_name=REGION
)

with open("extracted_text.txt", "r", encoding="utf-8") as file:
    extracted_text = file.read()

languages = {
    "hi": "Hindi",
    "te": "Telugu",
    "ta": "Tamil",
    "kn": "Kannada",
    "ml": "Malayalam"
}

for language_code, language_name in languages.items():

    response = translate.translate_text(
        Text=extracted_text,
        SourceLanguageCode="en",
        TargetLanguageCode=language_code
    )

    translated_text = response["TranslatedText"]

    filename = f"translated_text_{language_code}.txt"

    with open(filename, "w", encoding="utf-8") as file:
        file.write(translated_text)

    print(f"\n--- {language_name} ---\n")
    print(translated_text)
    print(f"\nSaved to {filename}")
