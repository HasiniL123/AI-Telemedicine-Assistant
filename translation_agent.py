"""
MedScribe AI - Translation Agent
Detects language and translates text to English if needed.

Usage:
    python translation_agent.py "text to translate"              # Translate text
    python translation_agent.py audio_samples/MalaySample.ogg    # Transcribe & translate audio
    python translation_agent.py --file transcript.txt            # Translate text file
    python translation_agent.py --input                          # Type/paste text
"""

import sys
import subprocess
import os
from datetime import datetime

# ── Check and Install Dependencies ──────────────────────────────────────────

REQUIRED_PACKAGES = {
    'groq': 'groq>=0.9.0',
    'langdetect': 'langdetect>=1.0.9'
}

def check_and_install_dependencies():
    """Check if required packages are installed, install them if missing."""
    missing_packages = []

    for package, install_name in REQUIRED_PACKAGES.items():
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(install_name)

    if missing_packages:
        print("\n📦 Installing missing dependencies...")
        print(f"Packages to install: {', '.join(missing_packages)}\n")

        try:
            for pkg in missing_packages:
                subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])
            print("\n✅ All dependencies installed successfully!\n")
        except Exception as e:
            print(f"\n❌ Error installing dependencies: {e}")
            print("\nPlease install manually:")
            print(f"  pip install {' '.join(missing_packages)}")
            sys.exit(1)

# Check dependencies before importing
check_and_install_dependencies()

# ── Now import all dependencies ─────────────────────────────────────────────

import json
from groq import Groq
from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException

# Set seed for consistent language detection
DetectorFactory.seed = 0

# ── Configure Groq API ──────────────────────────────────────────────────────

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY environment variable is not set. Run: $env:GROQ_API_KEY = 'your-key'")
client = Groq(api_key=GROQ_API_KEY)

# ── Configuration ─────────────────────────────────────────────────────────────

# Available Groq models
MODEL = "llama-3.3-70b-versatile"

# Language mapping
LANGUAGE_MAP = {
    'en': 'English',
    'ms': 'Malay',
    'ta': 'Tamil',
    'zh': 'Chinese',
    'zh-cn': 'Chinese',
    'zh-tw': 'Chinese',
    'id': 'Indonesian',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ar': 'Arabic',
    'hi': 'Hindi'
}

SYSTEM_PROMPT = """You are a professional translator. Translate the following text to English.
If the text is already in English, just return it as-is.
Maintain the original meaning, tone, and context.
Return ONLY the translated text, no explanations or additional text."""


# ── Core Translation Functions ─────────────────────────────────────────────

def detect_language(text: str) -> tuple:
    """
    Detect the language of the given text.
    Returns: (language_code, language_name)
    """
    try:
        # Clean the text for detection (remove empty lines)
        clean_text = ' '.join(text.split())

        if not clean_text or len(clean_text.strip()) < 3:
            return 'en', 'English'  # Default to English for empty text

        lang_code = detect(clean_text)
        lang_name = LANGUAGE_MAP.get(lang_code, lang_code)

        return lang_code, lang_name
    except LangDetectException:
        # If detection fails, default to English
        return 'en', 'English'
    except Exception as e:
        print(f"Language detection error: {e}")
        return 'en', 'English'


def translate_to_english(text: str, source_lang: str = None) -> tuple:
    """
    Translate text to English using Groq.
    Returns: (translated_text, source_language, is_english)
    """
    # Detect language if not provided
    if source_lang is None:
        lang_code, lang_name = detect_language(text)
    else:
        lang_code = source_lang
        lang_name = LANGUAGE_MAP.get(lang_code, lang_code)

    # If already English, return as-is
    if lang_code in ['en', 'en-US', 'en-GB']:
        return text, lang_name, True

    print(f"\n🌐 Detected language: {lang_name}")
    print(f"🔄 Translating to English...")

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Translate this text from {lang_name} to English:\n\n{text}"}
            ],
            temperature=0.1,
            max_tokens=2000
        )

        translated = response.choices[0].message.content.strip()
        return translated, lang_name, False

    except Exception as e:
        print(f"Translation error: {e}")
        return text, lang_name, False


# ── Audio Integration ──────────────────────────────────────────────────────

def process_audio_file(audio_path: str):
    """
    Transcribe audio and translate if needed.
    """
    try:
        from transcription_agent import SpeechToTextAgent

        print(f"\n🎙  Transcribing audio file: {audio_path}")

        # Initialize transcription agent
        transcriber = SpeechToTextAgent(model_size="base")

        # Transcribe the audio (now returns a dict: text, lang_code, lang_name)
        transcript_result = transcriber.transcribe(audio_path)
        transcript = transcript_result["text"]
        whisper_lang_code = transcript_result["lang_code"]
        whisper_lang_name = transcript_result["lang_name"]

        print(f"\n📝 Original Transcript:")
        print("-" * 60)
        if len(transcript) > 500:
            print(transcript[:500] + "...")
        else:
            print(transcript)
        print("-" * 60)

        # Reuse Whisper's language detection instead of re-detecting with langdetect
        detected_code, detected_name = whisper_lang_code, whisper_lang_name

        if detected_code in ['en', 'en-US', 'en-GB']:
            print(f"\n✅ Text is already in English")
            return transcript, transcript, detected_name

        # Translate
        translated, source_lang, _ = translate_to_english(transcript, source_lang=detected_code)

        print(f"\n✅ Translation complete!")
        print("-" * 60)
        print(translated)
        print("-" * 60)

        # Save both versions
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        original_file = f"original_transcript_{timestamp}.txt"
        translated_file = f"translated_english_{timestamp}.txt"

        with open(original_file, "w", encoding="utf-8") as f:
            f.write(f"Source Language: {detected_name}\n")
            f.write("=" * 60 + "\n\n")
            f.write(transcript)

        with open(translated_file, "w", encoding="utf-8") as f:
            f.write(f"Translated from: {detected_name}\n")
            f.write("=" * 60 + "\n\n")
            f.write(translated)

        print(f"\n💾 Saved files:")
        print(f"   Original: {original_file}")
        print(f"   Translated: {translated_file}")

        return transcript, translated, detected_name

    except ImportError:
        print("\n⚠️  transcription_agent.py not found.")
        print("   Please make sure transcription_agent.py is in the same folder.")
        return None, None, None
    except Exception as e:
        print(f"Error processing audio: {e}")
        return None, None, None


# ── File Processing ─────────────────────────────────────────────────────────

def process_text_file(file_path: str):
    """
    Read text from file and translate if needed.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()

        return process_text(text)
    except Exception as e:
        print(f"Error reading file: {e}")
        return None, None, None


def process_text(text: str):
    """
    Process text: detect language and translate if needed.
    """
    # Detect and translate
    detected_code, detected_name = detect_language(text)

    print(f"\n🌐 Detected language: {detected_name}")

    if detected_code in ['en', 'en-US', 'en-GB']:
        print(f"✅ Text is already in English")
        return text, text, detected_name

    translated, source_lang, _ = translate_to_english(text, source_lang=detected_code)

    print(f"\n✅ Translation complete!")

    return text, translated, detected_name


# ── Main Entry Point ────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    # Process audio file
    if args and args[0].endswith(('.wav', '.mp3', '.ogg', '.m4a', '.flac', '.mpeg', '.mp4')):
        original, translated, lang = process_audio_file(args[0])
        if original:
            print("\n" + "=" * 60)
            print("  TRANSLATION COMPLETE")
            print("=" * 60)
            print(f"Original ({lang}): {original}")
            print(f"Translated: {translated}")
        return

    # Read from text file
    if args and args[0] == "--file":
        if len(args) < 2:
            print("Error: Please specify a file path.")
            print("Usage: python translation_agent.py --file transcript.txt")
            sys.exit(1)
        original, translated, lang = process_text_file(args[1])
        if original:
            print("\n" + "=" * 60)
            print("  TRANSLATION COMPLETE")
            print("=" * 60)
            print(f"Original ({lang}): {original}")
            print(f"Translated: {translated}")
        return

    # Manual input mode
    if args and args[0] == "--input":
        print("Paste your text below. Press Enter twice when done:\n")
        lines = []
        while True:
            line = input()
            if line == "" and lines and lines[-1] == "":
                break
            lines.append(line)
        text = "\n".join(lines[:-1])
        original, translated, lang = process_text(text)
        if original:
            print("\n" + "=" * 60)
            print("  TRANSLATION COMPLETE")
            print("=" * 60)
            print(f"Original ({lang}): {original}")
            print(f"Translated: {translated}")
        return

    # Translate direct text from command line
    if args:
        text = " ".join(args)
        original, translated, lang = process_text(text)
        if original:
            print("\n" + "=" * 60)
            print("  TRANSLATION COMPLETE")
            print("=" * 60)
            print(f"Original ({lang}): {original}")
            print(f"Translated: {translated}")
        return

    # Default: show help
    print(__doc__)
    print("\nExamples:")
    print("  python translation_agent.py 'Halo, apa khabar?'")
    print("  python translation_agent.py audio_samples/MalaySample.ogg")
    print("  python translation_agent.py --file transcript.txt")
    print("  python translation_agent.py --input")


if __name__ == "__main__":
    main()