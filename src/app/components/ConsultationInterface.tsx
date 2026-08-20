import { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, Clock, FileAudio, AlertTriangle } from 'lucide-react';
import { TranscriptDisplay } from './TranscriptDisplay';
import type { User, Consultation } from '../App';

// Change this if your FastAPI server runs somewhere else.
const API_BASE_URL = 'http://localhost:8000';

interface ConsultationInterfaceProps {
  onNotesGenerated: (notes: any, transcript: any[]) => void;
  selectedConsultation: Consultation | null;
  currentUser: User;
}

export function ConsultationInterface({
  onNotesGenerated,
  selectedConsultation,
  currentUser,
}: ConsultationInterfaceProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Array<{
    speaker: 'patient' | 'doctor';
    original: string;
    translated?: string;
    timestamp: string;
  }>>([]);
  const [pendingNotes, setPendingNotes] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load selected consultation transcript
  useEffect(() => {
    if (selectedConsultation) {
      setTranscript(selectedConsultation.transcript);
    } else {
      setTranscript([]);
      setPendingNotes(null);
      setErrorMessage(null);
    }
  }, [selectedConsultation]);

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsProcessing(true);
    setTranscript([]);
    setPendingNotes(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/process-consultation`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.detail || `Server returned ${response.status}`);
      }

      const data = await response.json();
      setTranscript(data.transcript);
      setPendingNotes(data.clinicalNote);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while processing the audio file.');
    } finally {
      setIsProcessing(false);
      // Reset the input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveNotes = () => {
    if (!pendingNotes) return;
    onNotesGenerated(pendingNotes, transcript);
  };

  // Show view-only mode for selected consultations
  const isViewOnly = selectedConsultation !== null;

  return (
    <div className="p-6 space-y-6">
      {/* Viewing Past Consultation Banner */}
      {isViewOnly && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-5 flex items-center gap-4 shadow-md">
          <div className="bg-blue-500 p-2 rounded-xl">
            <Clock className="size-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-blue-900">Viewing Past Consultation</p>
            <p className="text-sm text-blue-700 font-medium">{selectedConsultation.date}</p>
          </div>
        </div>
      )}

      {/* Upload Controls */}
      {!isViewOnly && currentUser.role === 'doctor' && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,.ogg,.m4a,.flac,.mpeg,.mp4"
              onChange={handleFileSelected}
              disabled={isProcessing}
              className="hidden"
              id="audio-upload"
            />
            <label
              htmlFor="audio-upload"
              className={`flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold cursor-pointer ${
                isProcessing ? 'opacity-50 pointer-events-none' : 'hover:from-teal-600 hover:to-emerald-700'
              }`}
            >
              <Upload className="size-5" />
              Upload Consultation Audio
            </label>

            {isProcessing && (
              <div className="flex items-center gap-3 bg-teal-50 px-5 py-3 rounded-xl border-2 border-teal-300 shadow-md">
                <Loader2 className="size-4 animate-spin text-teal-600" />
                <span className="font-semibold text-teal-700">
                  Transcribing, translating & summarizing...
                </span>
              </div>
            )}
          </div>

          {pendingNotes && !isProcessing && !selectedConsultation?.clinicalNote && (
            <button
              onClick={saveNotes}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-8 py-3.5 rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              Save Clinical Notes
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl p-5 flex items-center gap-4 shadow-md">
          <div className="bg-red-500 p-2 rounded-xl">
            <AlertTriangle className="size-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-red-900">Processing failed</p>
            <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Patient View Message */}
      {!isViewOnly && currentUser.role === 'patient' && transcript.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-8 text-center shadow-md">
          <p className="text-blue-900 font-medium text-lg">
            Waiting for doctor to upload a consultation recording...
          </p>
        </div>
      )}

      {/* Transcript Display */}
      {transcript.length > 0 ? (
        <TranscriptDisplay transcript={transcript} />
      ) : !isViewOnly && currentUser.role === 'doctor' && !isProcessing ? (
        <div className="bg-gradient-to-br from-gray-50 to-teal-50 rounded-2xl p-16 text-center border-2 border-dashed border-gray-300">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-4 rounded-2xl inline-block mb-4">
            <FileAudio className="size-12 text-white" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Upload an audio file to begin the consultation
          </p>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            Supported formats: wav, mp3, ogg, m4a, flac, mp4
          </p>
        </div>
      ) : null}
    </div>
  );
}
