"""
MedScribe AI - API Server
Wraps transcription_agent.py, translation_agent.py, and summariser_agent.py
in a FastAPI HTTP service that the React frontend can call.

Setup (run once):
    pip install fastapi uvicorn python-multipart

Run:
    uvicorn api_server:app --reload --port 8000

Then open http://localhost:8000/docs to test it directly in the browser
before touching the frontend at all.
"""

import os
import shutil
import tempfile
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from transcription_agent import SpeechToTextAgent
from translation_agent import translate_to_english
from summariser_agent import analyze_transcript

SUPPORTED_AUDIO_EXTENSIONS = ('.wav', '.mp3', '.ogg', '.m4a', '.flac', '.mpeg', '.mp4')

app = FastAPI(title="MedScribe AI API")

# Allow the React dev server (Vite default port 5173) to call this API.
# Add more origins here later if you deploy the frontend somewhere else.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the Whisper model once at startup, not per-request (loading is slow).
print("Loading Whisper model (this happens once, at server startup)...")
transcriber = SpeechToTextAgent(model_size="base")
print("Whisper model loaded. Server ready.")


def map_summary_to_clinical_note(summary: dict) -> dict:
    """
    Translate the summariser_agent.py output shape into the shape
    ClinicalNotes.tsx expects on the frontend.
    """
    recommendations = list(summary.get("plan", []))
    for rx in summary.get("prescriptions", []):
        recommendations.append(f"Prescribed: {rx}")
    follow_up = summary.get("follow_up")
    if follow_up and follow_up != "N/A":
        recommendations.append(f"Follow-up: {follow_up}")

    diagnosis = []
    if summary.get("assessment"):
        diagnosis.append(summary["assessment"])
    diagnosis.extend(summary.get("red_flags", []))

    return {
        "chiefComplaint": summary.get("patient_chief_complaint", "N/A"),
        "symptoms": summary.get("symptoms", []),
        "assessment": summary.get("assessment", "N/A"),
        "diagnosis": diagnosis if diagnosis else ["Not specified"],
        "recommendations": recommendations if recommendations else ["None noted"],
        "timestamp": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/process-consultation")
async def process_consultation(file: UploadFile = File(...)):
    """
    Accepts an uploaded audio file, runs it through:
      1. Transcription (Whisper)
      2. Translation to English (if needed)
      3. Clinical summarization (Groq)

    Returns JSON matching the frontend's Consultation shape:
      { transcript: [...], clinicalNote: {...} }
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in SUPPORTED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Supported: {SUPPORTED_AUDIO_EXTENSIONS}",
        )

    # Save the upload to a temp file so Whisper/ffmpeg can read it from disk.
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # Step 1: Transcribe
        transcript_result = transcriber.transcribe(tmp_path)
        original_text = transcript_result["text"]
        lang_code = transcript_result["lang_code"]
        lang_name = transcript_result["lang_name"]

        # Step 2: Translate if needed
        if lang_code in ("en", "en-US", "en-GB"):
            translated_text = original_text
        else:
            translated_text, _, _ = translate_to_english(original_text, source_lang=lang_code)

        # Step 3: Summarize (always summarize the English version)
        summary = analyze_transcript(translated_text)
        clinical_note = map_summary_to_clinical_note(summary)

        # Build a transcript array matching the frontend's expected shape.
        # NOTE: no speaker diarization yet — the whole clip is one entry.
        transcript_entry = {
            "speaker": "patient",
            "original": original_text,
            "timestamp": "00:00",
        }
        if translated_text != original_text:
            transcript_entry["translated"] = translated_text

        return {
            "transcript": [transcript_entry],
            "clinicalNote": clinical_note,
            "detectedLanguage": lang_name,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")

    finally:
        # Clean up the temp file regardless of success/failure.
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
