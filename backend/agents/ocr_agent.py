import pypdfium2 as pdfium
import base64
import os
from loguru import logger
from groq import Groq
from config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def image_to_base64(filepath: str) -> str:
    with open(filepath, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def extract_text_from_image(filepath: str) -> dict:
    """Use Groq vision model to extract text from image."""
    try:
        ext = os.path.splitext(filepath)[-1].lower()
        mime = "image/jpeg" if ext in [".jpg", ".jpeg"] else "image/png"

        image_data = image_to_base64(filepath)

        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime};base64,{image_data}"
                        }
                    },
                    {
                        "type": "text",
                        "text": "Extract ALL text from this invoice image. Return only the raw text, line by line, exactly as it appears."
                    }
                ]
            }],
            temperature=0.1
        )

        raw_text = response.choices[0].message.content.strip()
        lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
        logger.info(f"Vision model extracted {len(lines)} lines from image")

        return {"success": True, "raw_text": raw_text, "lines": lines}

    except Exception as e:
        logger.error(f"Image extraction failed: {e}")
        return {"success": False, "error": str(e)}


def extract_text(filepath: str) -> dict:
    """Extract text from PDF or image file."""
    try:
        ext = os.path.splitext(filepath)[-1].lower()

        if ext == ".pdf":
            # Direct text extraction from PDF
            lines = []
            pdf = pdfium.PdfDocument(filepath)
            for page_index in range(len(pdf)):
                page = pdf[page_index]
                textpage = page.get_textpage()
                text = textpage.get_text_range()
                if text:
                    page_lines = [l.strip() for l in text.splitlines() if l.strip()]
                    lines.extend(page_lines)
            pdf.close()

            raw_text = "\n".join(lines)
            logger.info(f"Extracted {len(lines)} lines from PDF")
            return {"success": True, "raw_text": raw_text, "lines": lines}

        elif ext in [".jpg", ".jpeg", ".png"]:
            # Use Groq vision for images
            logger.info("Using Groq vision model for image OCR...")
            return extract_text_from_image(filepath)

        else:
            return {"success": False, "error": f"Unsupported file type: {ext}"}

    except Exception as e:
        logger.error(f"Text extraction failed: {e}")
        return {"success": False, "error": str(e)}