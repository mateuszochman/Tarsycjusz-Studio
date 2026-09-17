import React, { createContext, useContext, useState, useEffect } from 'react';
import { ContentRecord, ViewState } from './types';
import { demoData } from './demoData';

interface AppState {
  records: ContentRecord[];
  view: ViewState;
  selectedRecordId: string | null;
  darkMode: boolean;
  setRecords: (records: ContentRecord[]) => void;
  setView: (view: ViewState) => void;
  setSelectedRecordId: (id: string | null) => void;
  toggleDarkMode: () => void;
  updateRecord: (record: ContentRecord) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecordsState] = useState<ContentRecord[]>(() => {
    const saved = localStorage.getItem('tarsycjusz_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return demoData;
      }
    }
    return demoData;
  });

  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('tarsycjusz_theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('tarsycjusz_data', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tarsycjusz_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tarsycjusz_theme', 'light');
    }
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '1') { e.preventDefault(); setView('dashboard'); }
      if ((e.ctrlKey || e.metaKey) && e.key === '2') { e.preventDefault(); setView('list'); }
      if ((e.ctrlKey || e.metaKey) && e.key === '3') { e.preventDefault(); setView('export'); }
      // Search is handled in ContentList
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setRecords = (newRecords: ContentRecord[]) => setRecordsState(newRecords);
  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const updateRecord = (updated: ContentRecord) => {
    setRecordsState(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  return (
    <AppContext.Provider value={{
      records, view, selectedRecordId, darkMode,
      setRecords, setView, setSelectedRecordId, toggleDarkMode, updateRecord
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
