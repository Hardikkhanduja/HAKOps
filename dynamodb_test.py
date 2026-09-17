import boto3
from datetime import datetime, timezone

REGION = "ap-south-1"
TABLE_NAME = "DischargeCarePlans"

dynamodb = boto3.resource(
    "dynamodb",
    region_name=REGION
)

table = dynamodb.Table(TABLE_NAME)

item = {
    "patientId": "demo-python-001",
    "documentId": "test-discharge-001",
    "sourceDocument": "s3://discharge-companion-hakops-2026/test-discharge.pdf",
    "language": "hi",
    "reviewStatus": "PENDING",
    "createdAt": datetime.now(timezone.utc).isoformat()
}

table.put_item(Item=item)

print("Care plan saved successfully!")

response = table.get_item(
    Key={"patientId": "demo-python-001"}
)

print("\nRetrieved item:")
print(response.get("Item"))
