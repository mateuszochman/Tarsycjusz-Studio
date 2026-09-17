import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../store';
import { Search, Filter, ChevronRight, CheckCircle, Clock, FileText, AlertTriangle } from 'lucide-react';
import { ContentRecord } from '../types';
import { getMissingFields } from '../utils';

export default function ContentList() {
  const { records, setView, setSelectedRecordId } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = useMemo(() => {
    return records.filter(r => {
      const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.editorialStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [records, searchTerm, statusFilter]);

  const handleRowClick = (id: string) => {
    setSelectedRecordId(id);
    setView('detail');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'review': return <Clock size={16} className="text-amber-500" />;
      case 'draft': return <FileText size={16} className="text-slate-400" />;
      case 'rejected': return <AlertTriangle size={16} className="text-rose-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-light text-slate-800 dark:text-slate-100">Baza Treści</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Znaleziono: {filtered.length}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Szukaj (Ctrl+F)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 transition-shadow"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 appearance-none"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="approved">Zatwierdzone</option>
              <option value="review">Do przeglądu</option>
              <option value="draft">Szkice</option>
              <option value="rejected">Odrzucone</option>
            </select>
          </div>
        </div>
      </header>

      <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-4 px-6 font-medium text-sm">ID / Tytuł</th>
                <th className="py-4 px-6 font-medium text-sm">Rodzaj / Kategoria</th>
                <th className="py-4 px-6 font-medium text-sm">Status</th>
                <th className="py-4 px-6 font-medium text-sm">Braki</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.map(record => {
                const missing = getMissingFields(record);
                return (
                  <tr 
                    key={record.id} 
                    onClick={() => handleRowClick(record.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{record.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">{record.id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-700 dark:text-slate-300 capitalize">{record.kind}</div>
                      <div className="text-xs text-slate-500 mt-1">{record.category}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.editorialStatus)}
                        <span className="text-sm capitalize">{record.editorialStatus}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {missing.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
                          {missing.length} brakujące
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          Kompletny
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <ChevronRight className="inline-block text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" size={20} />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    Brak wyników spełniających kryteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
