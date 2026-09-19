import os
import boto3

REGION = os.getenv("AWS_REGION", "ap-south-1")
BUCKET = os.getenv("S3_BUCKET", "discharge-companion-hakops-2026")

DOCUMENT_ID = os.getenv("DOCUMENT_ID")

if not DOCUMENT_ID:
    raise RuntimeError("DOCUMENT_ID environment variable is required")

DOCUMENT = f"documents/{DOCUMENT_ID}"

textract = boto3.client("textract", region_name=REGION)

print(f"Processing S3 document: s3://{BUCKET}/{DOCUMENT}")

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
