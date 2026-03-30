import React, { useEffect, useState } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Timetable } from '../types';
import TimetableGrid from '../components/TimetableGrid';
import { Calendar, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function History() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Timetable | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth.currentUser) return;
      const path = 'timetables';
      try {
        const q = query(
          collection(db, path),
          where('userId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Timetable));
        setTimetables(results);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this timetable?')) return;
    
    const path = `timetables/${id}`;
    try {
      await deleteDoc(doc(db, 'timetables', id));
      setTimetables(timetables.filter(t => t.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">History</h1>
        <p className="text-zinc-500">View and manage your previously generated schedules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {timetables.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-zinc-200" />
              <p className="mt-4 text-sm text-zinc-500">No schedules found.</p>
            </div>
          ) : (
            timetables.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={cn(
                  "w-full flex items-center justify-between rounded-2xl border p-4 text-left transition-all",
                  selected?.id === t.id 
                    ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600" 
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                )}
              >
                <div className="overflow-hidden">
                  <h3 className="font-bold text-zinc-900 truncate">{t.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(t.createdAt).toLocaleDateString()} • {t.config.subjects.length} Subjects
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button 
                    onClick={(e) => handleDelete(t.id, e)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ChevronRight className={cn("h-5 w-5", selected?.id === t.id ? "text-indigo-600" : "text-zinc-300")} />
                </div>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <TimetableGrid timetable={selected} />
              </motion.div>
            ) : (
              <div className="hidden lg:flex h-full items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center">
                <div className="max-w-xs">
                  <Calendar className="mx-auto h-12 w-12 text-zinc-300" />
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900">No Selection</h3>
                  <p className="mt-2 text-sm text-zinc-500">Select a timetable from the list to view its details and download options.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
