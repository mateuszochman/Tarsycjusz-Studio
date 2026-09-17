export type ContentKind = 'modlitwa' | 'tekst mszalny' | 'wykaz katechizmowy' | 'tajemnica różańcowa' | 'rozważanie';
export type RightsStatus = 'public_domain' | 'licensed' | 'pending' | 'restricted';
export type EditorialStatus = 'draft' | 'review' | 'approved' | 'rejected';
export type RecordingStatus = 'missing' | 'recorded' | 'verified';

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
