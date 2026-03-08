import os
import shutil
from fastapi import UploadFile
from loguru import logger

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
UPLOAD_DIR = "uploads"

def init_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)

async def handle_upload(file: UploadFile) -> dict:
    """
    Accepts uploaded file, validates it, saves it to disk.
    Returns file info or error.
    """
    init_upload_dir()

    # Get file extension
    filename = file.filename
    ext = os.path.splitext(filename)[-1].lower()

    # Validate extension
    if ext not in ALLOWED_EXTENSIONS:
        logger.warning(f"Rejected file: {filename} — unsupported format")
        return {
            "success": False,
            "error": f"Unsupported file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}"
        }

    # Save file to uploads folder
    save_path = os.path.join(UPLOAD_DIR, filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    logger.info(f"File uploaded successfully: {filename}")

    return {
        "success": True,
        "filename": filename,
        "filepath": save_path,
        "extension": ext
    }