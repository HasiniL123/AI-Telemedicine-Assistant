import { useState } from 'react';
import { ConsultationInterface } from './components/ConsultationInterface';
import { PatientInfo } from './components/PatientInfo';
import { ClinicalNotes } from './components/ClinicalNotes';
import { AuthScreen } from './components/AuthScreen';
import { Stethoscope, LogOut } from 'lucide-react';

export type UserRole = 'doctor' | 'patient';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  preferredLanguage?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  transcript: Array<{
    speaker: 'patient' | 'doctor';
    original: string;
    translated?: string;
    timestamp: string;
  }>;
  clinicalNote?: any;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'consultation' | 'notes'>('consultation');
  const [clinicalNote, setClinicalNote] = useState<any>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([
    // Mock consultation history
    {
      id: 'cons-001',
      patientId: 'pat-001',
      patientName: 'Maria Garcia',
      doctorId: 'doc-001',
      doctorName: 'Dr. Sarah Johnson',
      date: '2026-02-05 10:30 AM',
      transcript: [
        {
          speaker: 'doctor',
          original: 'How have you been feeling since our last visit?',
          timestamp: '00:00',
        },
        {
          speaker: 'patient',
          original: 'Me he sentido mejor con la nueva medicina.',
          translated: 'I have been feeling better with the new medicine.',
          timestamp: '00:05',
        },
      ],
      clinicalNote: {
        chiefComplaint: 'Follow-up for hypertension management',
        symptoms: ['Blood pressure improved', 'No adverse effects from medication'],
        assessment: 'Patient showing good response to antihypertensive therapy.',
        diagnosis: ['Essential hypertension - controlled'],
        recommendations: ['Continue current medication', 'Follow-up in 3 months'],
        timestamp: '2026-02-05 10:45 AM',
      },
    },
    {
      id: 'cons-002',
      patientId: 'pat-001',
      patientName: 'Maria Garcia',
      doctorId: 'doc-001',
      doctorName: 'Dr. Sarah Johnson',
      date: '2026-01-15 09:00 AM',
      transcript: [
        {
          speaker: 'doctor',
          original: 'What brings you in today?',
          timestamp: '00:00',
        },
        {
          speaker: 'patient',
          original: 'Tengo presión alta y necesito chequeo.',
          translated: 'I have high blood pressure and need a checkup.',
          timestamp: '00:05',
        },
      ],
      clinicalNote: {
        chiefComplaint: 'Elevated blood pressure readings at home',
        symptoms: ['BP readings 150/95', 'Occasional headaches'],
        assessment: 'Uncontrolled hypertension requiring medication adjustment.',
        diagnosis: ['Essential hypertension'],
        recommendations: ['Start Lisinopril 10mg daily', 'Monitor BP at home', 'Follow-up in 2 weeks'],
        timestamp: '2026-01-15 09:30 AM',
      },
    },
  ]);

  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('consultation');
    setClinicalNote(null);
    setSelectedConsultation(null);
  };

  const handleSaveConsultation = (transcript: any[], notes: any) => {
    if (!currentUser) return;

    const newConsultation: Consultation = {
      id: `cons-${Date.now()}`,
      patientId: currentUser.role === 'patient' ? currentUser.id : 'pat-001',
      patientName: currentUser.role === 'patient' ? currentUser.name : 'Maria Garcia',
      doctorId: currentUser.role === 'doctor' ? currentUser.id : 'doc-001',
      doctorName: currentUser.role === 'doctor' ? currentUser.name : 'Dr. Sarah Johnson',
      date: new Date().toLocaleString(),
      transcript: transcript,
      clinicalNote: notes,
    };

    setConsultations([newConsultation, ...consultations]);
  };

  if (!currentUser) {
    return <AuthScreen onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-teal-100/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
                <Stethoscope className="size-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  MediTranscribe AI
                </h1>
                <p className="text-sm text-gray-600 font-medium">AI-Powered Telemedicine Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">{currentUser.name}</p>
                <p className="text-sm text-teal-600 capitalize font-medium">{currentUser.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-5 py-2.5 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg font-medium"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Patient/Doctor Info & History */}
          <div className="lg:col-span-1">
            <PatientInfo
              currentUser={currentUser}
              consultations={consultations}
              selectedConsultation={selectedConsultation}
              onSelectConsultation={setSelectedConsultation}
              onNewConsultation={() => {
                setSelectedConsultation(null);
                setClinicalNote(null);
                setActiveTab('consultation');
              }}
            />
          </div>

          {/* Right Column - Consultation & Notes */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-t-2xl border-b border-gray-200 shadow-sm">
              <nav className="flex gap-2 px-6">
                <button
                  onClick={() => setActiveTab('consultation')}
                  className={`py-4 px-6 border-b-3 transition-all font-medium ${
                    activeTab === 'consultation'
                      ? 'border-teal-500 text-teal-600 bg-teal-50/50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Consultation
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-4 px-6 border-b-3 transition-all font-medium ${
                    activeTab === 'notes'
                      ? 'border-teal-500 text-teal-600 bg-teal-50/50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Clinical Notes
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-b-2xl shadow-xl">
              {activeTab === 'consultation' ? (
                <ConsultationInterface
                  onNotesGenerated={(notes, transcript) => {
                    setClinicalNote(notes);
                    handleSaveConsultation(transcript, notes);
                  }}
                  selectedConsultation={selectedConsultation}
                  currentUser={currentUser}
                />
              ) : (
                <ClinicalNotes
                  clinicalNote={selectedConsultation?.clinicalNote || clinicalNote}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}