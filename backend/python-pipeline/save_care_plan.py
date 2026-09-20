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

    # Patient name is extracted deterministically from OCR
    # and carried through the AI/translation pipeline.
    patient_name = care_plan.get("patient_name") or "Patient"

    print()
    print("================================")
    print("SAVING CARE PLAN")
    print("================================")
    print()

    table.update_item(
        Key={
            "patientId": PATIENT_ID
        },
        UpdateExpression="""
            SET
                documentId = :documentId,
                #language = :language,
                sourceDocument = :sourceDocument,
                carePlan = :carePlan,
                patientName = :patientName,
                reviewStatus = :reviewStatus,
                #status = :status,
                createdAt = :createdAt
        """,
        ExpressionAttributeNames={
            "#language": "language",
            "#status": "status"
        },
        ExpressionAttributeValues={
            ":documentId": DOCUMENT_ID,
            ":language": LANGUAGE,
            ":sourceDocument": SOURCE_DOCUMENT,
            ":carePlan": care_plan,
            ":patientName": patient_name,
            ":reviewStatus": "PENDING",
            ":status": "ready",
            ":createdAt": datetime.now(
                timezone.utc
            ).isoformat()
        }
    )

    print("Care plan saved successfully!")
    print()
    print("Patient ID:", PATIENT_ID)
    print("Patient Name:", patient_name)
    print("Language:", LANGUAGE)
    print("Review Status:", "PENDING")
    print("Status:", "ready")
    print("Source:", SOURCE_DOCUMENT)
    print()
    print("Existing session/reminder fields preserved.")


if __name__ == "__main__":
    main()
