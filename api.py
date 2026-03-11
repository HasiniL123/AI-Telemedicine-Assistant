from flask import Flask, request, jsonify
import whisper
import os

app = Flask(__name__)

class SpeechToTextAgent:
    def __init__(self, model_size="medium"):
        self.model = whisper.load_model(model_size)

    def detect_language(self, audio_path):
        audio = whisper.load_audio(audio_path)
        audio = whisper.pad_or_trim(audio)
        mel = whisper.log_mel_spectrogram(audio, self.model.dims.n_mels).to(self.model.device)
        _, probs = self.model.detect_language(mel)
        
        supported_languages = {"en": "English", "ta": "Tamil", "ms": "Malay", "zh": "Chinese"}
        filtered_probs = {lang: probs[lang] for lang in supported_languages if lang in probs}
        detected = max(filtered_probs, key=filtered_probs.get)
        return detected, supported_languages[detected]

    def transcribe(self, audio_path):
        detected_code, detected_name = self.detect_language(audio_path)
        result = self.model.transcribe(audio_path, language=detected_code)
        return {"language": detected_name, "text": result["text"]}

# Initialize agent once when server starts
agent = SpeechToTextAgent()

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    
    # Save temporarily
    temp_path = "/tmp/temp_audio.ogg"
    audio_file.save(temp_path)
    
    # Transcribe
    result = agent.transcribe(temp_path)
    
    # Clean up
    os.remove(temp_path)
    
    return jsonify(result)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

---

## **Update `requirements.txt`:**
```
openai-whisper
flask
flask-cors