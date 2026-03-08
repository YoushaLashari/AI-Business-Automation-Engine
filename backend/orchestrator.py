from agents.input_agent import handle_upload
from agents.ocr_agent import extract_text
from agents.validation_agent import extract_invoice_fields, validate_fields
from agents.database_agent import save_invoice
from agents.notification_agent import send_notification
from loguru import logger


async def run_pipeline(file) -> dict:
    """
    Master pipeline — runs all agents in sequence.
    Input → OCR → Validation → Database → Notification
    """

    logger.info("═══════════════════════════════════")
    logger.info("   PIPELINE STARTED")
    logger.info("═══════════════════════════════════")

    # ── Step 1: Input Agent ──
    logger.info("Step 1: Input Agent — handling upload...")
    upload_result = await handle_upload(file)
    if not upload_result["success"]:
        return {"success": False, "stage": "input", "error": upload_result["error"]}

    filepath = upload_result["filepath"]
    logger.info(f"File saved at: {filepath}")

    # ── Step 2: OCR Agent ──
    logger.info("Step 2: OCR Agent — extracting text...")
    ocr_result = extract_text(filepath)
    if not ocr_result["success"]:
        return {"success": False, "stage": "ocr", "error": ocr_result["error"]}

    raw_text = ocr_result["raw_text"]
    logger.info(f"OCR complete — {len(ocr_result['lines'])} lines extracted")

    # ── Step 3: Validation Agent (Llama) ──
    logger.info("Step 3: Validation Agent — extracting fields with Llama...")
    extraction_result = extract_invoice_fields(raw_text)
    if not extraction_result["success"]:
        return {"success": False, "stage": "validation", "error": extraction_result["error"]}

    fields = extraction_result["fields"]

    validation = validate_fields(fields)
    if not validation["valid"]:
        return {
            "success": False,
            "stage": "validation",
            "error": f"Missing required fields: {validation['missing_fields']}",
            "partial_fields": fields
        }

    # ── Step 4: Database Agent ──
    logger.info("Step 4: Database Agent — saving to database...")
    db_result = save_invoice(fields, raw_text)
    if not db_result["success"]:
        return {"success": False, "stage": "database", "error": db_result["error"]}

    invoice_id = db_result["invoice_id"]

    # ── Step 5: Notification Agent ──
    logger.info("Step 5: Notification Agent — sending email...")
    notification_result = send_notification(invoice_id, fields)

    logger.info("═══════════════════════════════════")
    logger.info("   PIPELINE COMPLETE ✅")
    logger.info("═══════════════════════════════════")

    return {
        "success": True,
        "invoice_id": invoice_id,
        "fields": fields,
        "notification": notification_result
    }