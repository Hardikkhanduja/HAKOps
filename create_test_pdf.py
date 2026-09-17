from reportlab.pdfgen import canvas

pdf = canvas.Canvas("test-discharge.pdf")

lines = [
    "PATIENT DISCHARGE INSTRUCTIONS",
    "",
    "Patient: John Doe",
    "",
    "Medication:",
    "Paracetamol 500 mg - Take one tablet after food twice daily.",
    "",
    "Follow-up:",
    "Visit the doctor after 7 days.",
    "",
    "Warning Signs:",
    "Return to the hospital if symptoms become worse.",
    "",
    "Restriction:",
    "Avoid heavy physical activity for 3 days."
]

y = 800

for line in lines:
    pdf.drawString(60, y, line)
    y -= 25

pdf.save()

print("PDF created: test-discharge.pdf")
