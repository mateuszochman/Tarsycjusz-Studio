import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Download, Upload, CheckCircle, AlertTriangle, FileJson, Package } from 'lucide-react';
import { validateImport } from '../utils';

export default function ImportExport() {
  const { records, setRecords } = useAppContext();
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [includeDrafts, setIncludeDrafts] = useState(false);

  const handleBackupDownload = () => {
    const dataStr = JSON.stringify(records, null, 2);
    downloadFile(dataStr, `tarsycjusz-backup-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handlePackageExport = () => {
    let toExport = records.filter(r => r.editorialStatus === 'approved');
    if (includeDrafts) {
      toExport = records.filter(r => r.editorialStatus === 'approved' || r.editorialStatus === 'draft');
    }
    
    // Minimalne pule do paczki, by strona nie dostawała wewnętrznych komentarzy redakcyjnych
    const packageData = toExport.map(r => ({
      id: r.id,
      kind: r.kind,
      title: r.title,
      category: r.category,
      text: r.text,
      source: r.source,
      explanation3to6: r.explanation3to6,
      explanation7to12: r.explanation7to12,
      audioPath: r.audioPath,
      updatedAt: r.updatedAt
    }));

    const dataStr = JSON.stringify(packageData, null, 2);
    downloadFile(dataStr, `tarsycjusz-package-${new Date().toISOString().split('T')[0]}.json`);
  };

  const downloadFile = (content: string, filename: string) => {
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(content);
    const exportFileDefaultName = filename;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const { valid, errors } = validateImport(json);
        
        if (errors.length > 0) {
          setImportStatus({
            type: 'error',
            message: `Wykryto błędy importu (${errors.length}): \n${errors.slice(0,5).join('\n')}${errors.length > 5 ? '\n...' : ''}`
          });
        } else {
          // No duplicate logic handling for now beyond throwing errors if duplicates exist in file.
          // Wait, the requirement says "Import ma wykrywać błędy i powtarzające się ID, bez cichego nadpisywania danych."
          // So if ID exists in current records, we should block it or show error.
          const currentIds = new Set(records.map(r => r.id));
          const duplicateInExisting = valid.filter(r => currentIds.has(r.id));
          
          if (duplicateInExisting.length > 0) {
             setImportStatus({
              type: 'error',
              message: `Błąd: Następujące ID już istnieją w bazie i nie mogą zostać nadpisane: ${duplicateInExisting.map(d=>d.id).join(', ')}`
            });
            return;
          }

          setRecords([...records, ...valid]);
          setImportStatus({
            type: 'success',
            message: `Pomyślnie zaimportowano ${valid.length} rekordów.`
          });
        }
      } catch (err) {
        setImportStatus({ type: 'error', message: 'Nieprawidłowy plik JSON.' });
      }
    };
    reader.readAsText(file);
    // reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <header>
        <h2 className="text-2xl font-light text-slate-800 dark:text-slate-100">Import i Eksport</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Zarządzaj wymianą danych ze stroną docelową oraz kopiami zapasowymi.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sekcja Eksportu */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-700 pb-4">
            <Package size={24} />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Eksport Paczki</h3>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Generuje gotową paczkę JSON dla aplikacji docelowej zawierającą tylko niezbędne pola. Domyślnie eksportowane są wyłącznie teksty o statusie <span className="font-semibold text-emerald-600 dark:text-emerald-400">Zatwierdzone</span>.
          </p>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={includeDrafts}
              onChange={(e) => setIncludeDrafts(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dołącz również szkice (niezalecane do produkcji)</span>
          </label>

          <button 
            onClick={handlePackageExport}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition-colors font-medium"
          >
            <Download size={18} />
            <span>Pobierz Paczkę na Stronę</span>
          </button>
          
          <hr className="border-slate-100 dark:border-slate-700" />
          
          <button 
            onClick={handleBackupDownload}
            className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-3 rounded-xl transition-colors font-medium"
          >
            <FileJson size={18} />
            <span>Pobierz pełną kopię (Backup)</span>
          </button>
        </div>

        {/* Sekcja Importu */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-700 pb-4">
            <Upload size={24} />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Import Treści</h3>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Zaimportuj nowe rekordy z pliku JSON. Narzędzie zignoruje import, jeśli wykryje błędy strukturalne lub duplikaty istniejących ID (brak cichego nadpisywania).
          </p>

          <div>
            <input 
              type="file" 
              accept=".json"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label 
              htmlFor="file-upload"
              className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 py-8 rounded-xl transition-colors cursor-pointer"
            >
              <Upload size={24} />
              <span className="font-medium">Wybierz plik JSON</span>
            </label>
          </div>

          {importStatus.type && (
            <div className={`p-4 rounded-xl flex items-start space-x-3 text-sm whitespace-pre-wrap ${
              importStatus.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' 
                : 'bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400'
            }`}>
              {importStatus.type === 'success' ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
              <span>{importStatus.message}</span>
            </div>
          )}

          <details className="text-sm text-slate-500 dark:text-slate-400">
            <summary className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">Instrukcja formatu JSON</summary>
            <pre className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg overflow-x-auto text-xs border border-slate-200 dark:border-slate-700">
{`[
  {
    "id": "UNIKALNE_ID",
    "kind": "modlitwa", // "tekst mszalny" | "wykaz katechizmowy" ...
    "title": "Tytuł",
    "category": "Kategoria",
    "text": "Pełny tekst...",
    "source": "Źródło",
    "rightsStatus": "public_domain", // "licensed" | "pending"
    "explanation3to6": "Tekst dla 3-6...",
    "explanation7to12": "Tekst dla 7-12...",
    "editorialStatus": "draft", // "review" | "approved"
    "recordingStatus": "missing", // "recorded"
    "audioPath": "",
    "updatedAt": "2023-10-27T10:00:00Z"
  }
]`}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
