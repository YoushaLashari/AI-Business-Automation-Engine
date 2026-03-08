import json
import re
import uuid
from groq import Groq
from loguru import logger
from config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def extract_invoice_fields(raw_text: str) -> dict:
    """
    Send raw OCR text to Llama via Groq and extract structured invoice fields.
    """
    prompt = f"""
You are an invoice data extraction assistant.
Extract the following fields from the invoice text below.
Return ONLY a valid JSON object with these exact keys:
- invoice_number
- vendor
- date
- due_date
- total_amount (numeric only, no currency symbols)
- currency (e.g. USD, EUR, PKR)

If a field is not found, set its value to null.

Invoice Text:
{raw_text}

Return only the JSON object, nothing else.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )

        raw_response = response.choices[0].message.content.strip()
        logger.info(f"Groq raw response: {raw_response}")

        json_match = re.search(r'\{.*\}', raw_response, re.DOTALL)
        if not json_match:
            raise ValueError("No JSON found in response")

        fields = json.loads(json_match.group())
        logger.info(f"Extracted fields: {fields}")

        return {"success": True, "fields": fields}

    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        return {"success": False, "error": str(e)}


def validate_fields(fields: dict) -> dict:
    """Check required fields, use fallbacks if missing."""

    # Auto-generate invoice number if missing
    if not fields.get("invoice_number"):
        fields["invoice_number"] = f"AUTO-{uuid.uuid4().hex[:8].upper()}"
        logger.info(f"Auto-generated invoice number: {fields['invoice_number']}")

    # Check vendor and amount at minimum
    required = ["vendor", "total_amount"]
    missing = [f for f in required if not fields.get(f)]

    if missing:
        logger.warning(f"Missing required fields: {missing}")
        return {"valid": False, "missing_fields": missing}

    logger.info("All required fields present — invoice is valid")
    return {"valid": True, "missing_fields": []}