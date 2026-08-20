# AI-Telemedicine (MedScribe AI)

An AI-powered medical consultation tool. Upload a doctor-patient audio recording and
it automatically:

1. **Transcribes** the audio (OpenAI Whisper) — supports English, Malay, Tamil, and Chinese
2. **Translates** it to English if needed (Groq LLaMA)
3. **Summarizes** it into structured clinical notes — chief complaint, symptoms,
   assessment, diagnosis, prescriptions, and follow-up (Groq LLaMA)

The result is displayed in a React frontend alongside the original transcript.

> ⚠️ **Disclaimer:** This is a prototype/demo project. AI-generated clinical summaries
> should always be verified by a treating physician and are not a substitute for
> professional medical judgment.

---

## Architecture

```
React frontend (Vite, localhost:5173)
        │  HTTP upload
        ▼
FastAPI backend (localhost:8000)
        │
        ├── transcription_agent.py   (Whisper)
        ├── translation_agent.py     (Groq + langdetect)
        └── summariser_agent.py      (Groq)
```

---

## Prerequisites

Install these before you start:

| Tool | Why | Check with |
|---|---|---|
| **Python 3.10+** | Runs the backend and AI agents | `python --version` |
| **Node.js 18+ / npm** | Runs the React frontend | `node --version` |
| **ffmpeg** | Whisper uses it to read audio files | `ffmpeg -version` |
| **A free Groq API key** | Powers translation & summarization | [console.groq.com](https://console.groq.com) |

If `ffmpeg -version` fails on Windows, install it via [gyan.dev builds](https://www.gyan.dev/ffmpeg/builds/)
and add it to your PATH, or `winget install ffmpeg`.

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/Dhruvikaa001/AI-Telemedicine.git
cd AI-Telemedicine
```

### 2. Install Python dependencies

```bash
pip install openai-whisper torch groq langdetect python-docx fastapi uvicorn python-multipart
```

This includes `torch`, which is a large download (100MB+) — this is normal, Whisper needs it.

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Get your own Groq API key

1. Go to [console.groq.com/keys](https://console.groq.com/keys)
2. Sign up (free) and create a new API key
3. **Never commit this key to git or share it in chat/screenshots.**

### 5. Set the API key as an environment variable

**Windows (PowerShell) — temporary, current session only:**
```powershell
$env:GROQ_API_KEY = "your-key-here"
```

**Windows (PowerShell) — permanent (recommended):**
```powershell
setx GROQ_API_KEY "your-key-here"
```
After running `setx`, **fully close and reopen** your terminal/IDE for it to take effect.

**macOS / Linux:**
```bash
export GROQ_API_KEY="your-key-here"
# To make this permanent, add the line above to your ~/.bashrc or ~/.zshrc
```

Verify it's set:
```powershell
echo $env:GROQ_API_KEY      # PowerShell
echo $GROQ_API_KEY          # macOS/Linux/bash
```

---

## Running the app

You need **two terminals running at the same time.**

### Terminal 1 — Backend

```bash
uvicorn api_server:app --reload --port 8000
```

Wait for:
```
Loading Whisper model (this happens once, at server startup)...
Whisper model loaded. Server ready.
```

Test it directly at **http://localhost:8000/docs** before touching the frontend —
try uploading an audio file to `/process-consultation` from that page and confirm you get JSON back.

### Terminal 2 — Frontend

```bash
npm run dev
```

Open the printed URL (usually **http://localhost:5173**).

### Using the app

1. On the login screen, use **Quick Demo Login** → pick a doctor account (e.g. "Dr. Sarah Johnson")
2. Click **"Upload Consultation Audio"**
3. Select an audio file (`.wav`, `.mp3`, `.ogg`, `.m4a`, `.flac`, `.mpeg`, `.mp4`)
4. Wait for processing — it transcribes, translates, and summarizes in sequence
5. Review the transcript and generated clinical notes

A sample file is included in `audio_samples/` if you want to test quickly.

---

## Project structure

```
├── api_server.py            # FastAPI backend — wraps the 3 agents in an HTTP API
├── transcription_agent.py   # Whisper-based speech-to-text + language detection
├── translation_agent.py     # Translates non-English transcripts to English
├── summariser_agent.py      # Turns a transcript into structured clinical notes
├── full_pipeline.py         # CLI version: run all 3 agents on a local file
├── audio_samples/           # Sample audio for testing
├── src/                     # React frontend source
│   └── app/
│       └── components/
│           ├── ConsultationInterface.tsx  # Upload button + calls the backend
│           ├── TranscriptDisplay.tsx
│           ├── ClinicalNotes.tsx
│           └── ...
├── package.json
└── vite.config.ts
```

---

## Known limitations

- **No speaker diarization** — the transcript is returned as a single block of text,
  not split into separate doctor/patient turns. If the audio only contains the
  patient speaking (no doctor response), fields like "assessment" and
  "prescriptions" will correctly show as "not specified."
- **Language detection on short text** can occasionally mislabel closely related
  languages (e.g. Malay vs. Tagalog) — this mainly affects manually-typed text
  translation, not audio (Whisper's audio-based detection is more reliable).
- Runs locally only — not set up for production deployment (no auth, no persistent
  database, CORS is restricted to `localhost:5173`).

---

## Troubleshooting

| Problem | Likely cause |
|---|---|
| `GROQ_API_KEY environment variable is not set` | Env var not set in this terminal session — see Setup step 5 |
| `ModuleNotFoundError` for any package | Re-run the `pip install` command from Setup step 2 |
| `Failed to fetch` in the browser | Backend isn't running, or is on a different port than the frontend expects (check `API_BASE_URL` in `ConsultationInterface.tsx`) |
| ffmpeg / audio load errors | Confirm `ffmpeg -version` works, and double-check the uploaded file's extension is supported |
| Frontend shows a blank page / build error | Delete `node_modules` and `package-lock.json`, then `npm install` again |
