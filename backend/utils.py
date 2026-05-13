import os
import pathlib
from pdfminer.high_level import extract_text as pdf_extract_text
from docx import Document

def extract_text_from_file(file_path: str) -> str:
    """
    Extract raw text from a file (PDF, DOCX, or TXT).
    """
    ext = pathlib.Path(file_path).suffix.lower()
    
    if ext == ".pdf":
        return pdf_extract_text(file_path)
    
    elif ext == ".docx":
        doc = Document(file_path)
        return "\n".join(p.text for p in doc.paragraphs)
    
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def allowed_file(filename, allowed_extensions):
    """
    Check if a filename has an allowed extension.
    """
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in allowed_extensions
