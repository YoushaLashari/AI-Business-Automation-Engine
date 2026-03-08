from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from loguru import logger
from contextlib import asynccontextmanager

from models import init_db, get_db
from orchestrator import run_pipeline
from agents.database_agent import get_all_invoices

from agents.chat_agent import chat_with_invoices

from models import Invoice, get_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up — initializing database...")
    init_db()
    logger.info("Database ready ✅")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="AI Business Automation Engine",
    description="Multi-Agent Invoice Processing System",
    version="1.0.0",
    lifespan=lifespan
)

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "AI Business Automation Engine is running 🚀"}


@app.post("/upload")
async def upload_invoice(file: UploadFile = File(...)):
    """Upload and process an invoice through the full pipeline."""
    logger.info(f"Received file: {file.filename}")
    result = await run_pipeline(file)
    return result


@app.get("/invoices")
def list_invoices():
    """Retrieve all processed invoices from the database."""
    invoices = get_all_invoices()
    return {"total": len(invoices), "invoices": invoices}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/chat")
async def chat(question: dict):
    """Ask Llama questions about your invoices."""
    user_question = question.get("question", "")
    if not user_question:
        return {"error": "Please provide a question"}
    result = chat_with_invoices(user_question)
    return result




@app.delete("/invoices/{invoice_id}")
def delete_invoice(invoice_id: int):
    """Delete an invoice by ID."""
    db = next(get_db())
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        return {"success": False, "error": "Invoice not found"}
    db.delete(invoice)
    db.commit()
    db.close()
    logger.info(f"Invoice {invoice_id} deleted")
    return {"success": True, "message": f"Invoice {invoice_id} deleted"}