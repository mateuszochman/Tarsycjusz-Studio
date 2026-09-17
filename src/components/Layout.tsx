import React, { useRef, useState } from 'react';
import { useAppContext } from '../store';
import { LayoutDashboard, List, FileDown, Moon, Sun, Menu, X } from 'lucide-react';
import Dashboard from './Dashboard';
import ContentList from './ContentList';
import ContentDetail from './ContentDetail';
import ImportExport from './ImportExport';

export default function Layout() {
  const { view, setView, darkMode, toggleDarkMode, selectedRecordId } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Basic touch handling for swiping between views (optional but requested gesty)
  const touchStartX = useRef<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    // Swipe left
    if (diff > 50) {
      if (view === 'dashboard') setView('list');
      else if (view === 'list') setView('export');
    }
    // Swipe right
    if (diff < -50) {
      if (view === 'export') setView('list');
      else if (view === 'list') setView('dashboard');
      else if (view === 'detail') setView('list');
    }
    touchStartX.current = null;
  };

  const navItems = [
    { id: 'dashboard', label: 'Pulpit', icon: <LayoutDashboard size={20} /> },
    { id: 'list', label: 'Baza Treści', icon: <List size={20} /> },
    { id: 'export', label: 'Import / Eksport', icon: <FileDown size={20} /> },
  ];

  return (
    <div 
      className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-indigo-700 dark:text-indigo-400">Tarsycjusz Studio</h1>
          <button className="lg:hidden p-1" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id as any);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                view === item.id 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{darkMode ? 'Jasny motyw' : 'Ciemny motyw'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="lg:hidden p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 dark:text-slate-400">
            <Menu size={24} />
          </button>
          <span className="font-medium text-slate-800 dark:text-slate-200">Tarsycjusz Studio</span>
          <div className="w-8" /> {/* Spacer */}
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <div className="max-w-6xl mx-auto h-full">
            {view === 'dashboard' && <Dashboard />}
            {view === 'list' && <ContentList />}
            {view === 'detail' && selectedRecordId && <ContentDetail />}
            {view === 'export' && <ImportExport />}
          </div>
        </div>
      </main>
    </div>
  );
}
