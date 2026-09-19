import os
import boto3
import json
from datetime import datetime, timezone


REGION = os.getenv("AWS_REGION", "ap-south-1")
TABLE_NAME = os.getenv("DYNAMODB_TABLE", "DischargeCarePlans")

INPUT_FILE = "translated_care_plan.json"

DOCUMENT_ID = os.getenv("DOCUMENT_ID")

if not DOCUMENT_ID:
    raise RuntimeError("DOCUMENT_ID environment variable is required")

# The application UUID is used as patientId because
# patientId is the existing DynamoDB partition key.
PATIENT_ID = DOCUMENT_ID

LANGUAGE = os.getenv("TARGET_LANGUAGE", "hi")

BUCKET = os.getenv(
    "S3_BUCKET",
    "discharge-companion-hakops-2026"
)

SOURCE_DOCUMENT = (
    f"s3://{BUCKET}/documents/{DOCUMENT_ID}"
)

dynamodb = boto3.resource(
    "dynamodb",
    region_name=REGION
)

table = dynamodb.Table(TABLE_NAME)


def main():

    with open(
        INPUT_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        care_plan = json.load(file)

    item = {
        "patientId": PATIENT_ID,
        "documentId": DOCUMENT_ID,
        "language": LANGUAGE,
        "sourceDocument": SOURCE_DOCUMENT,
        "carePlan": care_plan,
        "reviewStatus": "PENDING",
        "status": "ready",
        "createdAt": datetime.now(
            timezone.utc
        ).isoformat()
    }

    print()
    print("================================")
    print("SAVING CARE PLAN")
    print("================================")
    print()

    table.put_item(Item=item)

    print("Care plan saved successfully!")
    print()
    print("Patient ID:", PATIENT_ID)
    print("Language:", LANGUAGE)
    print("Review Status:", "PENDING")
    print("Status:", "ready")
    print("Source:", SOURCE_DOCUMENT)


if __name__ == "__main__":
    main()
