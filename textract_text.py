import boto3

REGION = "ap-south-1"
BUCKET = "discharge-companion-hakops-2026"
DOCUMENT = "discharge-companion-medical report.jpeg"

textract = boto3.client("textract", region_name=REGION)

response = textract.detect_document_text(
    Document={
        "S3Object": {
            "Bucket": BUCKET,
            "Name": DOCUMENT
        }
    }
)

extracted_lines = []

for block in response["Blocks"]:
    if block["BlockType"] == "LINE":
        extracted_lines.append(block["Text"])

extracted_text = "\n".join(extracted_lines)

print("\n--- EXTRACTED TEXT ---\n")
print(extracted_text)

with open("extracted_text.txt", "w", encoding="utf-8") as file:
    file.write(extracted_text)

print("\nSaved to extracted_text.txt")
