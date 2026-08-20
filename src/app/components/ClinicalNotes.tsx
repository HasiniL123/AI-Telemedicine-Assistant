import { FileText, AlertCircle, Clipboard, CheckCircle, Download } from 'lucide-react';

interface ClinicalNotesProps {
  clinicalNote: any;
}

export function ClinicalNotes({ clinicalNote }: ClinicalNotesProps) {
  if (!clinicalNote) {
    return (
      <div className="p-16 text-center">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-4 rounded-2xl inline-block mb-5">
          <FileText className="size-12 text-white" />
        </div>
        <p className="text-gray-700 font-semibold text-lg">No clinical notes generated yet</p>
        <p className="text-sm text-gray-600 mt-2 font-medium">
          Record a consultation and click "Generate Clinical Notes" to see AI-powered documentation
        </p>
      </div>
    );
  }

  const copyToClipboard = () => {
    const noteText = `
CLINICAL NOTE - ${clinicalNote.timestamp}

CHIEF COMPLAINT:
${clinicalNote.chiefComplaint}

SYMPTOMS:
${clinicalNote.symptoms.map((s: string) => `• ${s}`).join('\n')}

CLINICAL ASSESSMENT:
${clinicalNote.assessment}

DIAGNOSIS:
${clinicalNote.diagnosis.map((d: string) => `• ${d}`).join('\n')}

RECOMMENDATIONS:
${clinicalNote.recommendations.map((r: string) => `• ${r}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(noteText);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg">
            <CheckCircle className="size-7 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Clinical Notes Generated</h3>
            <p className="text-sm text-gray-600 font-medium">{clinicalNote.timestamp}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-5 py-2.5 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg font-semibold"
          >
            <Clipboard className="size-4" />
            Copy
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold">
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-5 shadow-md">
        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <div className="bg-blue-500 p-1.5 rounded-lg">
            <FileText className="size-4 text-white" />
          </div>
          Chief Complaint
        </h4>
        <p className="text-blue-800 font-medium">{clinicalNote.chiefComplaint}</p>
      </div>

      {/* Symptoms */}
      <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 shadow-md">
        <h4 className="font-bold text-gray-900 mb-4">Reported Symptoms</h4>
        <ul className="space-y-3">
          {clinicalNote.symptoms.map((symptom: string, index: number) => (
            <li key={index} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
              <div className="size-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700 font-medium">{symptom}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Clinical Assessment */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-300 rounded-2xl p-5 shadow-md">
        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <div className="bg-slate-600 p-1.5 rounded-lg">
            <FileText className="size-4 text-white" />
          </div>
          Clinical Assessment
        </h4>
        <p className="text-slate-700 leading-relaxed font-medium">{clinicalNote.assessment}</p>
      </div>

      {/* Diagnosis */}
      <div className="bg-gradient-to-br from-stone-50 to-neutral-100 border-2 border-stone-300 rounded-2xl p-5 shadow-md">
        <h4 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          <div className="bg-stone-600 p-1.5 rounded-lg">
            <AlertCircle className="size-4 text-white" />
          </div>
          Differential Diagnosis
        </h4>
        <ul className="space-y-3">
          {clinicalNote.diagnosis.map((diagnosis: string, index: number) => (
            <li key={index} className="flex items-start gap-3 bg-white rounded-xl p-3 border-2 border-stone-200">
              <div className="size-2 bg-stone-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-stone-800 font-medium">{diagnosis}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-zinc-50 to-gray-100 border-2 border-zinc-300 rounded-2xl p-5 shadow-md">
        <h4 className="font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <div className="bg-zinc-600 p-1.5 rounded-lg">
            <CheckCircle className="size-4 text-white" />
          </div>
          Recommendations & Next Steps
        </h4>
        <ul className="space-y-3">
          {clinicalNote.recommendations.map((recommendation: string, index: number) => (
            <li key={index} className="flex items-start gap-3 bg-white rounded-xl p-3 border-2 border-zinc-200">
              <CheckCircle className="size-5 text-zinc-600 flex-shrink-0" />
              <span className="text-zinc-800 font-medium">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-300 rounded-2xl p-5 shadow-sm">
        <p className="text-xs text-gray-700 font-medium leading-relaxed">
          <strong className="text-gray-900">Note:</strong> This clinical note was generated using AI assistance based on the consultation transcript. 
          Please review and verify all information before finalizing the patient record. AI-generated content should be used 
          as a support tool and not as a replacement for professional medical judgment.
        </p>
      </div>
    </div>
  );
}