import { User, UserCircle, Languages } from 'lucide-react';

interface TranscriptEntry {
  speaker: 'patient' | 'doctor';
  original: string;
  translated?: string;
  timestamp: string;
}

interface TranscriptDisplayProps {
  transcript: TranscriptEntry[];
}

export function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-teal-700 border-b-2 border-teal-200 pb-3 font-semibold">
        <Languages className="size-5" />
        <span>Real-time Transcription & Translation</span>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {transcript.map((entry, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              entry.speaker === 'doctor' ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 size-11 rounded-2xl flex items-center justify-center shadow-lg ${
                entry.speaker === 'doctor'
                  ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
              }`}
            >
              {entry.speaker === 'doctor' ? (
                <UserCircle className="size-6" />
              ) : (
                <User className="size-6" />
              )}
            </div>

            {/* Message Content */}
            <div
              className={`flex-1 ${
                entry.speaker === 'doctor' ? 'text-left' : 'text-right'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-900">
                  {entry.speaker === 'doctor' ? 'Doctor' : 'Patient'}
                </span>
                <span className="text-xs text-gray-500 font-medium">{entry.timestamp}</span>
              </div>

              <div
                className={`inline-block rounded-2xl px-5 py-3 shadow-md ${
                  entry.speaker === 'doctor'
                    ? 'bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-900 border-2 border-teal-200'
                    : 'bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-900 border-2 border-cyan-200'
                }`}
              >
                {/* Always show original if there's a translation */}
                {entry.translated && (
                  <div className="mb-3 pb-3 border-b-2 border-opacity-50">
                    <div className="flex items-center gap-1 mb-2">
                      <Languages className="size-3" />
                      <span className="text-xs font-semibold opacity-70">
                        Original (Spanish)
                      </span>
                    </div>
                    <p className="text-sm italic font-medium opacity-80">{entry.original}</p>
                  </div>
                )}
                
                {/* Show translated or original */}
                {entry.translated && (
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Languages className="size-3" />
                      <span className="text-xs font-semibold opacity-70">
                        Translated (English)
                      </span>
                    </div>
                    <p className="font-medium">{entry.translated}</p>
                  </div>
                )}
                
                {!entry.translated && (
                  <p className="text-sm font-medium">{entry.original}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}