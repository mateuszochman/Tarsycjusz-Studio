import React, { useMemo } from 'react';
import { useAppContext } from '../store';
import { ArrowLeft, AlertCircle, PlayCircle, BookOpen, User, Calendar } from 'lucide-react';
import { getMissingFields } from '../utils';

export default function ContentDetail() {
  const { records, selectedRecordId, setView, setSelectedRecordId } = useAppContext();
  
  const record = useMemo(() => {
    return records.find(r => r.id === selectedRecordId);
  }, [records, selectedRecordId]);

  if (!record) {
    return (
      <div className="text-center py-12">
        <p>Rekord nie istnieje.</p>
        <button onClick={() => setView('list')} className="text-indigo-500 mt-4 underline">Wróć do listy</button>
      </div>
    );
  }

  const missing = getMissingFields(record);

  const handleBack = () => {
    setSelectedRecordId(null);
    setView('list');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300 pb-12">
      <header className="flex items-center space-x-4">
        <button 
          onClick={handleBack}
          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-medium text-slate-900 dark:text-slate-100">{record.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-mono mt-1">{record.id} • {record.kind}</p>
        </div>
      </header>

      {missing.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="text-rose-500 mt-0.5 shrink-0" size={20} />
          <div>
            <h4 className="text-rose-800 dark:text-rose-400 font-medium">Brakujące informacje</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-rose-700 dark:text-rose-300">
              {missing.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolumna boczna z metadanymi */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3">Metadane</h3>
            
            <DetailItem label="Kategoria" value={record.category} />
            <DetailItem label="Status Redakcyjny" value={
              <span className={`inline-flex px-2 py-0.5 rounded text-sm capitalize ${
                record.editorialStatus === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                record.editorialStatus === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' :
                'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
              }`}>{record.editorialStatus}</span>
            } />
            <DetailItem label="Prawa do użycia" value={<span className="capitalize">{record.rightsStatus.replace('_', ' ')}</span>} />
            <DetailItem label="Ostatnia akt." value={new Date(record.updatedAt).toLocaleDateString('pl-PL')} />
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center space-x-2">
              <PlayCircle size={18} className="text-indigo-500" />
              <span>Status Nagrania</span>
            </h3>
            <DetailItem label="Status" value={<span className="capitalize">{record.recordingStatus}</span>} />
            {record.audioPath && (
              <DetailItem label="Ścieżka" value={<span className="font-mono text-xs break-all">{record.audioPath}</span>} />
            )}
          </div>
          
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center space-x-2">
              <BookOpen size={18} className="text-amber-500" />
              <span>Źródło</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{record.source || <span className="italic opacity-50">Brak</span>}</p>
          </div>
        </div>

        {/* Kolumna główna z tekstem i podglądem */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4 text-lg">Tekst Główny</h3>
            <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-800 dark:text-slate-200">
              {record.text || <span className="italic text-slate-400 font-sans text-base">Brak tekstu</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-5">
              <h4 className="flex items-center space-x-2 font-medium text-blue-900 dark:text-blue-300 mb-3">
                <User size={18} />
                <span>Podgląd (3-6 lat)</span>
              </h4>
              <p className="text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                {record.explanation3to6 || <span className="italic opacity-50">Brak objaśnienia</span>}
              </p>
            </div>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-5">
              <h4 className="flex items-center space-x-2 font-medium text-indigo-900 dark:text-indigo-300 mb-3">
                <User size={18} />
                <span>Podgląd (7-12 lat)</span>
              </h4>
              <p className="text-indigo-800 dark:text-indigo-200 whitespace-pre-wrap">
                {record.explanation7to12 || <span className="italic opacity-50">Brak objaśnienia</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{label}</p>
      <div className="mt-1 text-slate-800 dark:text-slate-200">{value}</div>
    </div>
  );
}
