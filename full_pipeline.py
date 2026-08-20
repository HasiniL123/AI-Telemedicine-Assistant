"""
Full Pipeline: Transcribe → Translate → Summarize
Usage: python full_pipeline.py audio_samples/MalaySample.mp4
"""

import sys
import os
from datetime import datetime

# Import all agents
from transcription_agent import SpeechToTextAgent
from translation_agent import translate_to_english
from summariser_agent import analyze_transcript, print_summary, save_to_file

SUPPORTED_AUDIO_EXTENSIONS = ('.wav', '.mp3', '.ogg', '.m4a', '.flac', '.mpeg', '.mp4')


def process_full_pipeline(audio_path):
    print("\n" + "=" * 70)
    print("  🚀 MEDSCRIBE AI - FULL PIPELINE")
    print("  Transcribe → Translate → Summarize")
    print("=" * 70)

    audio_path = os.path.abspath(audio_path)
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    ext = os.path.splitext(audio_path)[1].lower()
    if ext not in SUPPORTED_AUDIO_EXTENSIONS:
        raise ValueError(f"Unsupported audio format '{ext}'. Supported: {SUPPORTED_AUDIO_EXTENSIONS}")

    # Step 1: Transcribe
    print("\n📝 Step 1: Transcribing audio...")
    transcriber = SpeechToTextAgent(model_size="base")
    transcript_result = transcriber.transcribe(audio_path)
    transcript = transcript_result["text"]
    whisper_lang_code = transcript_result["lang_code"]
    whisper_lang_name = transcript_result["lang_name"]

    print(f"\n📝 Original Transcript ({len(transcript)} chars):")
    print("-" * 60)
    print(transcript[:500] + "..." if len(transcript) > 500 else transcript)
    print("-" * 60)

    # Step 2: Translate if needed (reuse Whisper's language detection instead of re-detecting)
    print("\n🌐 Step 2: Checking language...")
    lang_code, lang_name = whisper_lang_code, whisper_lang_name

    if lang_code in ['en', 'en-US', 'en-GB']:
        print(f"✅ Already in English")
        translated = transcript
    else:
        print(f"🔄 Translating from {lang_name} to English...")
        translated, source_lang, _ = translate_to_english(transcript, source_lang=lang_code)
        print(f"✅ Translation complete!")

        print(f"\n📝 Translated Text ({len(translated)} chars):")
        print("-" * 60)
        print(translated[:500] + "..." if len(translated) > 500 else translated)
        print("-" * 60)

    # Step 3: Summarize
    print("\n⚕️ Step 3: Generating medical summary...")
    summary = analyze_transcript(translated)

    # Display summary
    print_summary(summary)

    # Save everything
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Save transcript
    with open(f"transcript_{timestamp}.txt", "w", encoding="utf-8") as f:
        f.write("ORIGINAL TRANSCRIPT\n")
        f.write("=" * 60 + "\n\n")
        f.write(transcript)
        if translated != transcript:
            f.write("\n\nTRANSLATED TO ENGLISH\n")
            f.write("=" * 60 + "\n\n")
            f.write(translated)

    # Save summary
    save_to_file(summary, f"consultation_summary_{timestamp}.md")

    print("\n" + "=" * 70)
    print("  ✅ FULL PIPELINE COMPLETE!")
    print("=" * 70)
    print(f"📄 Files saved with timestamp: {timestamp}")

    return transcript, translated, summary


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python full_pipeline.py audio_samples/MalaySample.mp4")
        sys.exit(1)

    process_full_pipeline(sys.argv[1])