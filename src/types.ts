export const CONTENT_KINDS = ['modlitwa', 'tekst mszalny', 'wykaz katechizmowy', 'tajemnica różańcowa', 'rozważanie'] as const;
export type ContentKind = typeof CONTENT_KINDS[number];

export const RIGHTS_STATUSES = ['public_domain', 'licensed', 'pending', 'restricted'] as const;
export type RightsStatus = typeof RIGHTS_STATUSES[number];

export const EDITORIAL_STATUSES = ['draft', 'review', 'approved', 'rejected'] as const;
export type EditorialStatus = typeof EDITORIAL_STATUSES[number];

export const RECORDING_STATUSES = ['missing', 'recorded', 'verified'] as const;
export type RecordingStatus = typeof RECORDING_STATUSES[number];

export interface ExportPackage {
  version: "1.0";
  records: ContentRecord[];
}

export interface ContentRecord {
  id: string;
  kind: ContentKind;
  title: string;
  category: string;
  text: string;
  source: string;
  rightsStatus: RightsStatus;
  explanation3to6: string;
  explanation7to12: string;
  editorialStatus: EditorialStatus;
  recordingStatus: RecordingStatus;
  audioPath: string;
  updatedAt: string; // ISO date string
}

export type ViewState = 'dashboard' | 'list' | 'detail' | 'export';
