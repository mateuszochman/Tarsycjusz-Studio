import React, { useMemo } from 'react';
import { useAppContext } from '../store';
import { BarChart3, FileText, CheckCircle, Clock, AlertTriangle, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const { records, setView } = useAppContext();

  const stats = useMemo(() => {
    const drafts = records.filter(r => r.editorialStatus === 'draft').length;
    const review = records.filter(r => r.editorialStatus === 'review').length;
    const approved = records.filter(r => r.editorialStatus === 'approved').length;
    const rejected = records.filter(r => r.editorialStatus === 'rejected').length;
    const missingAudio = records.filter(r => r.recordingStatus === 'missing').length;

    return { drafts, review, approved, rejected, missingAudio, total: records.length };
  }, [records]);

  const byKind = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      counts[r.kind] = (counts[r.kind] || 0) + 1;
    });
    return counts;
  }, [records]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-light text-slate-800 dark:text-slate-100">Pulpit redakcyjny</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Przegląd zawartości modlitewnika</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Zatwierdzone" count={stats.approved} icon={<CheckCircle className="text-emerald-500" />} />
        <StatCard title="Do przeglądu" count={stats.review} icon={<Clock className="text-amber-500" />} />
        <StatCard title="Szkice" count={stats.drafts} icon={<FileText className="text-slate-400" />} />
        <StatCard title="Odrzucone" count={stats.rejected} icon={<AlertTriangle className="text-rose-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
            <BookOpen className="text-indigo-500" size={20} />
            <span>Treści według typu</span>
          </h3>
          <div className="space-y-4">
            {Object.entries(byKind).sort((a,b) => b[1] - a[1]).map(([kind, count]) => (
              <div key={kind} className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 capitalize">{kind}</span>
                <span className="font-semibold bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-sm">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
            <BarChart3 className="text-indigo-500" size={20} />
            <span>Szybkie akcje</span>
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => setView('list')}
              className="w-full text-left px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            >
              Przeglądaj całą bazę →
            </button>
            <button 
              onClick={() => setView('export')}
              className="w-full text-left px-4 py-3 bg-slate-50 dark:bg-slate-700/30 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              Przygotuj paczkę do eksportu →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, count, icon }: { title: string, count: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{title}</p>
        <p className="text-3xl font-light text-slate-800 dark:text-slate-100">{count}</p>
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
        {icon}
      </div>
    </div>
  );
}
