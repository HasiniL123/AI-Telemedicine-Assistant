import { useState } from 'react';
import { User, Calendar, Globe, FileText, ChevronDown, Plus, History, Users, ChevronRight, ArrowLeft } from 'lucide-react';
import type { User as UserType, Consultation } from '../App';

interface PatientInfoProps {
  currentUser: UserType;
  consultations: Consultation[];
  selectedConsultation: Consultation | null;
  onSelectConsultation: (consultation: Consultation | null) => void;
  onNewConsultation: () => void;
}

export function PatientInfo({
  currentUser,
  consultations,
  selectedConsultation,
  onSelectConsultation,
  onNewConsultation,
}: PatientInfoProps) {
  const [activeView, setActiveView] = useState<'info' | 'history'>('info');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Get unique doctors (for patient view) or patients (for doctor view)
  const persons = currentUser.role === 'doctor'
    ? Array.from(
        new Set(consultations.map(c => JSON.stringify({ id: c.patientId, name: c.patientName })))
      ).map(str => JSON.parse(str))
    : Array.from(
        new Set(consultations.filter(c => c.patientId === currentUser.id).map(c => JSON.stringify({ id: c.doctorId, name: c.doctorName })))
      ).map(str => JSON.parse(str));

  // Get consultations for selected person
  const getConsultationsForPerson = (personId: string) => {
    if (currentUser.role === 'doctor') {
      return consultations.filter(c => c.patientId === personId);
    } else {
      return consultations.filter(c => c.doctorId === personId && c.patientId === currentUser.id);
    }
  };

  // Get consultation count for each person
  const getConsultationCount = (personId: string) => {
    return getConsultationsForPerson(personId).length;
  };

  // Mock patient data
  const patientData = {
    name: currentUser.role === 'patient' ? currentUser.name : selectedConsultation?.patientName || 'Maria Garcia',
    age: 45,
    gender: 'Female',
    language: 'Spanish',
    id: currentUser.role === 'patient' ? currentUser.id : selectedConsultation?.patientId || 'PT-2026-0842',
    lastVisit: consultations[0]?.date || 'January 15, 2026',
    conditions: ['Type 2 Diabetes', 'Hypertension'],
  };

  const handleBackToList = () => {
    setSelectedPersonId(null);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-teal-100">
      {/* Account Dropdown */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/30 backdrop-blur-sm p-2.5 rounded-xl shadow-lg">
              <User className="size-6 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{currentUser.name}</p>
              <p className="text-teal-100 text-sm capitalize font-medium">{currentUser.role} Account</p>
            </div>
          </div>
          <ChevronDown className="size-5 text-white opacity-80" />
        </div>
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-teal-50/30">
        <div className="flex">
          <button
            onClick={() => {
              setActiveView('info');
              setSelectedPersonId(null);
            }}
            className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
              activeView === 'info'
                ? 'bg-white text-teal-600 border-b-3 border-teal-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            {currentUser.role === 'doctor' ? 'Patient Info' : 'My Info'}
          </button>
          <button
            onClick={() => {
              setActiveView('history');
              setSelectedPersonId(null);
            }}
            className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
              activeView === 'history'
                ? 'bg-white text-teal-600 border-b-3 border-teal-500 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <History className="size-4" />
              History
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeView === 'info' ? (
          <div className="space-y-5">
            {currentUser.role === 'doctor' && (
              <button
                onClick={onNewConsultation}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-3.5 rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
              >
                <Plus className="size-5" />
                New Consultation
              </button>
            )}

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-200">
              <label className="text-sm text-teal-700 font-semibold">
                {currentUser.role === 'doctor' ? 'Patient Name' : 'Name'}
              </label>
              <p className="font-semibold text-gray-900 text-lg mt-1">{patientData.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-teal-300 transition-all">
                <label className="text-sm text-gray-600 font-semibold">Age</label>
                <p className="font-semibold text-gray-900 text-lg mt-1">{patientData.age}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-teal-300 transition-all">
                <label className="text-sm text-gray-600 font-semibold">Gender</label>
                <p className="font-semibold text-gray-900 text-lg mt-1">{patientData.gender}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
              <label className="text-sm text-gray-600 flex items-center gap-2 font-semibold">
                <Globe className="size-4 text-teal-500" />
                Primary Language
              </label>
              <p className="font-semibold text-gray-900 mt-1">{patientData.language}</p>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
              <label className="text-sm text-gray-600 flex items-center gap-2 font-semibold">
                <FileText className="size-4 text-teal-500" />
                {currentUser.role === 'doctor' ? 'Patient ID' : 'ID'}
              </label>
              <p className="font-semibold text-gray-900 mt-1">{patientData.id}</p>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
              <label className="text-sm text-gray-600 flex items-center gap-2 font-semibold">
                <Calendar className="size-4 text-teal-500" />
                Last Visit
              </label>
              <p className="font-semibold text-gray-900 mt-1">{patientData.lastVisit}</p>
            </div>

            <div>
              <label className="text-sm text-gray-700 font-semibold mb-3 block">Medical History</label>
              <div className="space-y-2">
                {patientData.conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl px-4 py-3 text-sm text-amber-900 font-medium shadow-sm"
                  >
                    {condition}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back button when viewing specific person's consultations */}
            {selectedPersonId && (
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold mb-2"
              >
                <ArrowLeft className="size-4" />
                Back to {currentUser.role === 'doctor' ? 'Patients' : 'Doctors'}
              </button>
            )}

            {/* Show list of persons (doctors/patients) */}
            {!selectedPersonId ? (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <Users className="size-5 text-teal-500" />
                  {currentUser.role === 'doctor' ? 'My Patients' : 'My Doctors'} ({persons.length})
                </h3>
                
                {persons.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-teal-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <Users className="size-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 font-medium">
                      No {currentUser.role === 'doctor' ? 'patients' : 'doctors'} found
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {persons.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => setSelectedPersonId(person.id)}
                        className="w-full text-left p-5 rounded-2xl border-2 border-gray-200 hover:border-teal-400 bg-white hover:bg-gradient-to-br hover:from-teal-50 hover:to-emerald-50 transition-all shadow-md hover:shadow-lg group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                              {currentUser.role === 'doctor' ? (
                                <User className="size-6 text-white" />
                              ) : (
                                <Users className="size-6 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg">{person.name}</p>
                              <p className="text-sm text-gray-600 font-medium mt-1">
                                {getConsultationCount(person.id)} consultation{getConsultationCount(person.id) !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="size-6 text-teal-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Show consultations for selected person */
              <div>
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 mb-4 border-2 border-teal-300">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {persons.find(p => p.id === selectedPersonId)?.name}
                  </h3>
                  <p className="text-sm text-teal-700 font-medium">
                    {getConsultationsForPerson(selectedPersonId).length} consultation{getConsultationsForPerson(selectedPersonId).length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {getConsultationsForPerson(selectedPersonId).map((consultation) => (
                    <button
                      key={consultation.id}
                      onClick={() => {
                        onSelectConsultation(consultation);
                        setActiveView('info');
                      }}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all shadow-md hover:shadow-lg ${
                        selectedConsultation?.id === consultation.id
                          ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-emerald-50 scale-[1.02]'
                          : 'border-gray-200 hover:border-teal-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            {consultation.date}
                          </p>
                          {consultation.clinicalNote && (
                            <p className="text-sm text-gray-700 line-clamp-2 mt-2">
                              {consultation.clinicalNote.chiefComplaint}
                            </p>
                          )}
                        </div>
                        {consultation.clinicalNote && (
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md ml-2">
                            Notes
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}