import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from PyPDF2 import PdfReader
from docx import Document
import tempfile

# ===============================
# Load environment variables
# ===============================
load_dotenv()

PORT = int(os.getenv("PORT", 8080))
API_KEY = os.getenv("GEMINI_API_KEY")

# ===============================
# Flask app setup
# ===============================
app = Flask(__name__)
CORS(app)

# ===============================
# Gemini Configuration
# ===============================
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

# ===============================
# Helper functions
# ===============================
def extract_text_from_pdf(file_path):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

# ===============================
# Routes
# ===============================
@app.route("/", methods=["GET"])
def home():
    return "Welcome to the home page!"

# ===================================
# 📄 Analyze Resume Route
# ===================================
@app.route("/analyze", methods=["POST"])
def analyze_resume():
    try:
        if "resume" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["resume"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            file.save(tmp.name)
            file_path = tmp.name

        text = ""

        # ===============================
        # Extract text based on file type
        # ===============================
        if file.mimetype == "application/pdf":
            text = extract_text_from_pdf(file_path)

        elif file.mimetype == (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ):
            text = extract_text_from_docx(file_path)

        else:
            os.remove(file_path)
            return jsonify({"error": "Only PDF and DOCX files are supported"}), 400

        # Cleanup temp file
        os.remove(file_path)

        # ===============================
        # Quick heuristic check
        # ===============================
        if len(text.split()) < 100:
            return jsonify({"error": "File content is too short to be a Resume"}), 400

        # =======================================================
        # 🧠 Step 1: Resume Detection (YES / NO)
        # =======================================================
        detection_prompt = f"""
You are a content classifier.
Analyze the following text and answer ONLY with "YES" or "NO".
Does this text appear to be a resume or CV (curriculum vitae)?

Text:
{text[:2000]}
"""

        detection_response = model.generate_content(detection_prompt)
        detection_text = detection_response.text.strip().upper()

        if "YES" not in detection_text:
            return jsonify({"error": "Uploaded file does not appear to be a Resume/CV."}), 400

        # ===============================================
        # 🧠 Step 2: Resume Analysis
        # ===============================================
        analysis_prompt = f"""
Analyze the following resume and provide a summary including:
- Candidate’s main skills and strengths
- Education and experience highlights
- Areas of improvement
- Suggested job roles suitable for this profile
- enhancement_tips

Resume text:
{text}

Convert the analysis into JSON (key-value pairs).
"""

        result = model.generate_content(analysis_prompt)
        ai_response = result.text

        return jsonify({"analysis": ai_response})

    except Exception as e:
        print("Error analyzing resume:", e)
        return jsonify({"error": "Failed to analyze Resume"}), 500


# ===============================
# Run server
# ===============================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
