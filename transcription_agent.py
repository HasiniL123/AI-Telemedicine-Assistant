import whisper

class SpeechToTextAgent:
    def __init__(self, model_size="base"):
        """
        model_size options: tiny, base, small, medium, large
        base is a good balance for beginners
        """
        self.model = whisper.load_model(model_size)

    def detect_language(self, audio_path):
        """
        Detects the language of the audio file
        Only accepts: English, Tamil, Malay, Chinese
        """
        audio = whisper.load_audio(audio_path)
        audio = whisper.pad_or_trim(audio)
        mel = whisper.log_mel_spectrogram(audio, self.model.dims.n_mels).to(self.model.device)

        _, probs = self.model.detect_language(mel)

        # Only consider our 4 supported languages
        supported_languages = {"en": "English", "ta": "Tamil", "ms": "Malay", "zh": "Chinese"}
        filtered_probs = {lang: probs[lang] for lang in supported_languages if lang in probs}

        detected = max(filtered_probs, key=filtered_probs.get)
        return detected, supported_languages[detected]

    def transcribe(self, audio_path):
        """
        Auto detects language and transcribes audio
        """
        detected_code, detected_name = self.detect_language(audio_path)
        print(f"Detected language: {detected_name}")

        result = self.model.transcribe(
            audio_path,
            language=detected_code
        )
        return result["text"]


if __name__ == "__main__":
    agent = SpeechToTextAgent(model_size ="medium")

    audio_file = "audio_samples/MalaySample.ogg"
    text = agent.transcribe(audio_file)

    print("Transcription:")
    print(text)