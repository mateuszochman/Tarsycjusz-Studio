import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store';
import { Download, Upload, CheckCircle, AlertTriangle, FileJson, Package, CheckSquare, Square } from 'lucide-react';
import { validateImport, getMissingFields } from '../utils';

export default function ImportExport() {
  const { records, setRecords } = useAppContext();
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  
  // Znajdź rekordy kwalifikujące się do eksportu paczki
  const eligibleRecords = useMemo(() => {
    return records.filter(r => 
      !r.id.startsWith('DEMO-') && 
      !r.title.includes('[DEMO]') && 
      r.editorialStatus === 'approved' && 
      (r.rightsStatus === 'public_domain' || r.rightsStatus === 'licensed') &&
      getMissingFields(r).length === 0
    );
  }, [records]);

  // Zaznaczone rekordy do eksportu
  const [selectedForExport, setSelectedForExport] = useState<Set<string>>(new Set(eligibleRecords.map(r => r.id)));

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedForExport);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedForExport(newSet);
  };

  const selectAll = () => setSelectedForExport(newSet => newSet.size === eligibleRecords.length ? new Set() : new Set(eligibleRecords.map(r => r.id)));

  const handleBackupDownload = () => {
    const backupData = {
      version: "1.0",
      records: records
    };
    const dataStr = JSON.stringify(backupData, null, 2);
    downloadFile(dataStr, `tarsycjusz-backup-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handlePackageExport = () => {
    const toExport = eligibleRecords.filter(r => selectedForExport.has(r.id));
    
    // Minimalne pule do paczki
    const packageData = {
      version: "1.0",
      records: toExport.map(r => ({
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
      }))
    };

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
        const { valid, errors } = validateImport(json, records);
        
        if (errors.length > 0) {
          setImportStatus({
            type: 'error',
            message: `Wykryto błędy importu, plik odrzucony (${errors.length}): \n${errors.slice(0,5).join('\n')}${errors.length > 5 ? '\n...' : ''}`
          });
        } else {
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <header>
        <h2 className="text-2xl font-light text-slate-800 dark:text-slate-100">Import i Eksport</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Zarządzaj wymianą danych ze stroną docelową oraz kopiami zapasowymi.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sekcja Eksportu */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 flex flex-col">
          <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-700 pb-4 shrink-0">
            <Package size={24} />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Eksport Paczki</h3>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-300 shrink-0">
            Wybierz zatwierdzone, kompletne teksty do eksportu na stronę docelową. Rekordy demonstracyjne oraz szkice są trwale zablokowane i pomijane.
          </p>

          <div className="flex-1 overflow-auto min-h-[200px] border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2">
            {eligibleRecords.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-sm text-center p-4">
                <AlertTriangle size={24} className="mb-2 opacity-50" />
                <p>Brak rekordów spełniających kryteria eksportu.</p>
                <p className="text-xs mt-1">(Wymagany status: Zatwierdzone, potwierdzone prawa, 100% kompletności pól, brak znacznika DEMO)</p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-700 mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Gotowe do publikacji ({eligibleRecords.length})</span>
                  <button onClick={selectAll} className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
                    {selectedForExport.size === eligibleRecords.length ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
                  </button>
                </div>
                {eligibleRecords.map(r => (
                  <label key={r.id} className="flex items-start space-x-3 p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedForExport.has(r.id)}
                      onChange={() => toggleSelection(r.id)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={r.title}>{r.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{r.id}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handlePackageExport}
            disabled={selectedForExport.size === 0}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white py-3 rounded-xl transition-colors font-medium shrink-0"
          >
            <Download size={18} />
            <span>Eksportuj wybrane ({selectedForExport.size})</span>
          </button>
          
          <hr className="border-slate-100 dark:border-slate-700 shrink-0" />
          
          <button 
            onClick={handleBackupDownload}
            className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-3 rounded-xl transition-colors font-medium shrink-0"
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
            Zaimportuj nowe rekordy z pliku JSON. Narzędzie automatycznie odrzuci cały plik, jeśli wykryje chociaż jeden błąd strukturalny, zły typ pola lub duplikat ID.
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
            <summary className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">Instrukcja formatu JSON (v1.0)</summary>
            <pre className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg overflow-x-auto text-xs border border-slate-200 dark:border-slate-700">
{`{
  "version": "1.0",
  "records": [
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
  ]
}`}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
