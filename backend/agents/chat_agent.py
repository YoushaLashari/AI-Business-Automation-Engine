from groq import Groq
from loguru import logger
from config import GROQ_API_KEY
from agents.database_agent import get_all_invoices

client = Groq(api_key=GROQ_API_KEY)

def chat_with_invoices(question: str) -> dict:
    """Let Llama via Groq reason over all invoices in the database."""
    try:
        invoices = get_all_invoices()

        if not invoices:
            return {
                "success": True,
                "answer": "No invoices found in the database yet. Please upload some invoices first."
            }

        invoice_text = ""
        for inv in invoices:
            invoice_text += f"""
Invoice ID     : {inv['id']}
Invoice Number : {inv['invoice_number']}
Vendor         : {inv['vendor']}
Date           : {inv['date']}
Due Date       : {inv['due_date']}
Total Amount   : {inv['currency']} {inv['total_amount']}
Status         : {inv['status']}
---"""

        prompt = f"""
You are a smart business assistant with access to an invoice database.
Answer the user's question based on the invoice data below.
Be concise, helpful and accurate.

Invoice Database:
{invoice_text}

User Question: {question}

Answer:
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        answer = response.choices[0].message.content.strip()
        logger.info(f"Chat response generated for: {question}")

        return {
            "success": True,
            "answer": answer,
            "invoices_analyzed": len(invoices)
        }

    except Exception as e:
        logger.error(f"Chat agent failed: {e}")
        return {"success": False, "error": str(e)}