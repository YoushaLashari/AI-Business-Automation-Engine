import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from loguru import logger
from config import EMAIL_SENDER, EMAIL_PASSWORD, EMAIL_RECEIVER


def send_notification(invoice_id: int, fields: dict) -> dict:
    """
    Send email notification after invoice is processed.
    """
    try:
        subject = f"✅ Invoice Processed — {fields.get('invoice_number', 'N/A')}"

        body = f"""
Hello,

An invoice has been successfully processed by the AI Business Automation Engine.

📄 Invoice Details:
─────────────────────────────
Invoice Number : {fields.get('invoice_number', 'N/A')}
Vendor         : {fields.get('vendor', 'N/A')}
Date           : {fields.get('date', 'N/A')}
Due Date       : {fields.get('due_date', 'N/A')}
Total Amount   : {fields.get('currency', '')} {fields.get('total_amount', 'N/A')}
Database ID    : {invoice_id}
─────────────────────────────

This is an automated notification.

Regards,
AI Business Automation Engine
        """

        # Build email
        msg = MIMEMultipart()
        msg["From"] = EMAIL_SENDER
        msg["To"] = EMAIL_RECEIVER
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        # Send via Gmail SMTP
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, EMAIL_RECEIVER, msg.as_string())

        logger.info(f"Notification email sent for invoice ID: {invoice_id}")

        return {
            "success": True,
            "message": f"Email sent to {EMAIL_RECEIVER}"
        }

    except Exception as e:
        logger.error(f"Notification failed: {e}")
        return {
            "success": False,
            "error": str(e)
        }