import { ContentRecord } from './types';

export const validateImport = (data: any): { valid: ContentRecord[], errors: string[] } => {
  const errors: string[] = [];
  const valid: ContentRecord[] = [];
  const seenIds = new Set<string>();

  if (!Array.isArray(data)) {
    errors.push('Oczekiwano tablicy obiektów JSON.');
    return { valid, errors };
  }

  data.forEach((item, index) => {
    if (!item.id || typeof item.id !== 'string') {
      errors.push(`Rekord [${index}]: Brak lub nieprawidłowe stałe ID.`);
      return;
    }
    if (seenIds.has(item.id)) {
      errors.push(`Rekord [${index}]: Znaleziono powielone ID "${item.id}".`);
      return;
    }
    seenIds.add(item.id);

    const requiredFields = ['kind', 'title', 'category', 'text', 'source', 'rightsStatus', 'editorialStatus', 'recordingStatus'];
    const missing = requiredFields.filter(f => !item[f]);
    if (missing.length > 0) {
      errors.push(`Rekord [${item.id}]: Brak wymaganych pól: ${missing.join(', ')}.`);
      return;
    }

    valid.push(item as ContentRecord);
  });

  return { valid, errors };
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
