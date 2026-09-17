import os
import boto3
import json
from datetime import datetime, timezone


REGION = "ap-south-1"
TABLE_NAME = "DischargeCarePlans"

INPUT_FILE = "translated_care_plan.json"

PATIENT_ID = os.getenv("PATIENT_ID", "demo-002")

DOCUMENT_ID = os.getenv(
    "DOCUMENT_ID",
    "discharge-companion-medical-report"
)

LANGUAGE = os.getenv("TARGET_LANGUAGE", "hi")

SOURCE_DOCUMENT = os.getenv(
    "SOURCE_DOCUMENT",
    "s3://discharge-companion-hakops-2026/"
    "discharge-companion-medical report.jpeg"
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


if __name__ == "__main__":
    main()
