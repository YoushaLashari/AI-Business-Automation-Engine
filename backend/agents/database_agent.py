from models import Invoice, init_db, SessionLocal as _SessionLocal
from loguru import logger

def get_session():
    """Get DB session, initializing if needed."""
    from models import SessionLocal
    if SessionLocal is None:
        init_db()
    from models import SessionLocal
    return SessionLocal()

def save_invoice(fields: dict, raw_text: str) -> dict:
    try:
        db = get_session()
        invoice = Invoice(
            invoice_number=fields.get("invoice_number"),
            vendor=fields.get("vendor"),
            date=fields.get("date"),
            due_date=fields.get("due_date"),
            total_amount=fields.get("total_amount"),
            currency=fields.get("currency"),
            raw_text=raw_text,
            status="processed"
        )
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        db.close()
        logger.info(f"Invoice saved to DB with ID: {invoice.id}")
        return {"success": True, "invoice_id": invoice.id}

    except Exception as e:
        logger.error(f"Database save failed: {e}")
        return {"success": False, "error": str(e)}


def get_all_invoices() -> list:
    try:
        db = get_session()
        invoices = db.query(Invoice).all()
        db.close()
        result = []
        for inv in invoices:
            result.append({
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "vendor": inv.vendor,
                "date": inv.date,
                "due_date": inv.due_date,
                "total_amount": inv.total_amount,
                "currency": inv.currency,
                "status": inv.status,
                "created_at": str(inv.created_at)
            })
        logger.info(f"Retrieved {len(result)} invoices from DB")
        return result

    except Exception as e:
        logger.error(f"Database fetch failed: {e}")
        return []