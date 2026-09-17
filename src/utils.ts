import { ContentRecord, CONTENT_KINDS, RIGHTS_STATUSES, EDITORIAL_STATUSES, RECORDING_STATUSES } from './types';

export const validateImport = (data: any, existingRecords: ContentRecord[]): { valid: ContentRecord[], errors: string[] } => {
  const errors: string[] = [];
  const valid: ContentRecord[] = [];
  const seenIds = new Set<string>();
  const existingIds = new Set(existingRecords.map(r => r.id));

  let recordsToValidate = [];
  
  if (data && typeof data === 'object' && data.version && Array.isArray(data.records)) {
     if (data.version !== "1.0") {
         errors.push(`Nieobsługiwana wersja formatu JSON: ${data.version}`);
     }
     recordsToValidate = data.records;
  } else if (Array.isArray(data)) {
     recordsToValidate = data; // Fallback for older format if needed
  } else {
     errors.push('Nieprawidłowy format pliku: oczekiwano obiektu z wersją i tablicą "records".');
     return { valid: [], errors };
  }

  recordsToValidate.forEach((item: any, index: number) => {
    if (!item || typeof item !== 'object') {
      errors.push(`Rekord [${index}]: Nie jest obiektem.`);
      return;
    }
    if (!item.id || typeof item.id !== 'string') {
      errors.push(`Rekord [${index}]: Brak lub nieprawidłowe stałe ID (musi być ciągiem znaków).`);
      return;
    }
    if (seenIds.has(item.id)) {
      errors.push(`Rekord [${item.id}]: Znaleziono powielone ID wewnątrz pliku importu.`);
    }
    if (existingIds.has(item.id)) {
      errors.push(`Rekord [${item.id}]: To ID już istnieje w bazie. Nadpisywanie jest zablokowane.`);
    }
    seenIds.add(item.id);

    // Strict Type & Enum Checks
    if (!CONTENT_KINDS.includes(item.kind)) errors.push(`Rekord [${item.id}]: Nieznany rodzaj treści "${item.kind}".`);
    if (typeof item.title !== 'string') errors.push(`Rekord [${item.id}]: Tytuł musi być ciągiem znaków.`);
    if (typeof item.category !== 'string') errors.push(`Rekord [${item.id}]: Kategoria musi być ciągiem znaków.`);
    if (typeof item.text !== 'string') errors.push(`Rekord [${item.id}]: Tekst musi być ciągiem znaków.`);
    if (typeof item.source !== 'string') errors.push(`Rekord [${item.id}]: Źródło musi być ciągiem znaków.`);
    
    if (!RIGHTS_STATUSES.includes(item.rightsStatus)) errors.push(`Rekord [${item.id}]: Nieznany status praw "${item.rightsStatus}".`);
    if (typeof item.explanation3to6 !== 'string') errors.push(`Rekord [${item.id}]: Objaśnienie 3-6 musi być ciągiem znaków.`);
    if (typeof item.explanation7to12 !== 'string') errors.push(`Rekord [${item.id}]: Objaśnienie 7-12 musi być ciągiem znaków.`);
    
    if (!EDITORIAL_STATUSES.includes(item.editorialStatus)) errors.push(`Rekord [${item.id}]: Nieznany status redakcyjny "${item.editorialStatus}".`);
    if (!RECORDING_STATUSES.includes(item.recordingStatus)) errors.push(`Rekord [${item.id}]: Nieznany status nagrania "${item.recordingStatus}".`);
    if (typeof item.audioPath !== 'string') errors.push(`Rekord [${item.id}]: Ścieżka audio musi być ciągiem znaków.`);
    
    if (item.updatedAt && isNaN(Date.parse(item.updatedAt))) {
        errors.push(`Rekord [${item.id}]: Zły format daty updatedAt.`);
    }

    valid.push({
       id: item.id,
       kind: item.kind as any,
       title: item.title,
       category: item.category,
       text: item.text,
       source: item.source,
       rightsStatus: item.rightsStatus as any,
       explanation3to6: item.explanation3to6,
       explanation7to12: item.explanation7to12,
       editorialStatus: item.editorialStatus as any,
       recordingStatus: item.recordingStatus as any,
       audioPath: item.audioPath,
       updatedAt: item.updatedAt || new Date().toISOString()
    });
  });

  // All or nothing
  if (errors.length > 0) {
    return { valid: [], errors };
  }

  return { valid, errors: [] };
};

export const getMissingFields = (record: ContentRecord): string[] => {
  const missing: string[] = [];
  if (!record.text.trim()) missing.push('Pełny tekst');
  if (!record.explanation3to6.trim()) missing.push('Objaśnienie 3-6');
  if (!record.explanation7to12.trim()) missing.push('Objaśnienie 7-12');
  if (!record.source.trim()) missing.push('Źródło');
  if (record.recordingStatus === 'recorded' || record.recordingStatus === 'verified') {
    if (!record.audioPath.trim()) missing.push('Ścieżka audio (wymagana przy statusie nagrania)');
  }
  return missing;
};
