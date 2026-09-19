import json


REQUIRED_FIELDS = [
    "diagnosis",
    "treatment",
    "medications",
    "follow_up",
    "important_instructions",
    "warnings",
    "unclear_information"
]


def validate_care_plan(care_plan):

    # -------------------------
    # Top-level fields
    # -------------------------

    for field in REQUIRED_FIELDS:
        if field not in care_plan:
            raise ValueError(
                f"Missing required field: {field}"
            )

    # -------------------------
    # Diagnosis
    # -------------------------

    diagnosis = care_plan["diagnosis"]

    if not isinstance(diagnosis, dict):
        raise ValueError(
            "diagnosis must be an object"
        )

    for field in ["title", "explanation"]:
        if field not in diagnosis:
            raise ValueError(
                f"diagnosis.{field} is missing"
            )

    # -------------------------
    # Treatment
    # -------------------------

    treatment = care_plan["treatment"]

    if not isinstance(treatment, dict):
        raise ValueError(
            "treatment must be an object"
        )

    if "summary" not in treatment:
        raise ValueError(
            "treatment.summary is missing"
        )

    # -------------------------
    # Medications
    # -------------------------

    medications = care_plan["medications"]

    if not isinstance(medications, list):
        raise ValueError(
            "medications must be a list"
        )

    medication_fields = [
        "name",
        "dose",
        "frequency",
        "route",
        "duration",
        "needs_confirmation"
    ]

    for index, medication in enumerate(medications):

        if not isinstance(medication, dict):
            raise ValueError(
                f"Medication {index} must be an object"
            )

        for field in medication_fields:

            if field not in medication:
                raise ValueError(
                    f"Medication {index} "
                    f"missing field: {field}"
                )

        if not isinstance(
            medication["needs_confirmation"],
            bool
        ):
            raise ValueError(
                f"Medication {index} "
                "needs_confirmation must be true/false"
            )

    # -------------------------
    # Follow-up
    # -------------------------

    follow_up = care_plan["follow_up"]

    if not isinstance(follow_up, dict):
        raise ValueError(
            "follow_up must be an object"
        )

    for field in [
        "when",
        "where",
        "doctor",
        "instructions"
    ]:

        if field not in follow_up:
            raise ValueError(
                f"follow_up.{field} is missing"
            )

    # -------------------------
    # List fields
    # -------------------------

    for field in [
        "important_instructions",
        "warnings",
        "unclear_information"
    ]:

        if not isinstance(
            care_plan[field],
            list
        ):
            raise ValueError(
                f"{field} must be a list"
            )

    return True


def main():

    with open(
        "gemini_care_plan.json",
        "r",
        encoding="utf-8"
    ) as file:

        care_plan = json.load(file)

    try:

        validate_care_plan(care_plan)

        print()
        print("================================")
        print("CARE PLAN VALIDATION SUCCESS")
        print("================================")
        print("JSON structure is valid.")
        print("Required fields are present.")
        print("Ready for the next pipeline stage.")

    except ValueError as error:

        print()
        print("================================")
        print("CARE PLAN VALIDATION FAILED")
        print("================================")
        print(error)


if __name__ == "__main__":
    main()
