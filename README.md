# AI Telemedicine Assistant - Transcription Agent

Part of a multi-agent system for processing medical audio in multiple languages (English, Tamil, Malay, Chinese).

## Overview

This agent uses OpenAI Whisper to transcribe audio files with automatic language detection. It's designed to run as a microservice in a Kubernetes cluster alongside translation and summarization agents.

## Features

- **Multi-language support**: English, Tamil, Malay, Chinese
- **Automatic language detection**: No need to specify language upfront
- **RESTful API**: Flask-based API for easy integration
- **Dockerized**: Ready for container deployment
- **Kubernetes-ready**: Designed for cloud deployment on AWS EKS

## Tech Stack

- **Python 3.11**
- **OpenAI Whisper** (medium model)
- **Flask** for API
- **Docker** for containerization
- **FFmpeg** for audio processing

## API Endpoint

### POST /transcribe
Upload an audio file to get transcription

**Request:**
```bash
curl -X POST -F "audio=@sample.ogg" http://localhost:5000/transcribe
```

**Response:**
```json
{
  "language": "English",
  "text": "Transcribed text here..."
}
```

## Local Development

### Prerequisites
- Python 3.11+
- FFmpeg

### Setup
```bash
pip install -r requirements.txt
python api.py
```

Server runs on `http://localhost:5000`

## Docker

### Build
```bash
docker build -t transcription-agent .
```

### Run
```bash
docker run -p 5000:5000 transcription-agent
```

## Deployment

This agent is deployed on AWS EKS as part of the AI Telemedicine Assistant system.

Docker Hub: `hasinildp/transcription-agent:latest`

## Project Team

- **Transcription Agent**: [Your Name]
- **Translation Agent**: [Teammate 1]
- **Summarization Agent**: [Teammate 2]

## License

[Add license here]
