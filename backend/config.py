from dotenv import load_dotenv
import os

load_dotenv()

# Email Settings
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_RECEIVER = os.getenv("EMAIL_RECEIVER")

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./invoices.db")

# Ollama
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# App
APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", 8000))


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
