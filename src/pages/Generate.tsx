import { useState } from 'react';
import { Day, ScheduleConfig, Subject, TimeSlot, Timetable } from '../types';
import { Scheduler } from '../services/scheduler';
import { db, auth, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import TimetableGrid from '../components/TimetableGrid';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2, Plus, Save, Trash2, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Generate() {
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', startTime: '09:00', endTime: '10:00', isBreak: false },
    { id: '2', startTime: '10:00', endTime: '11:00', isBreak: false },
    { id: '3', startTime: '11:00', endTime: '12:00', isBreak: true, label: 'Short Break' },
    { id: '4', startTime: '12:00', endTime: '13:00', isBreak: false },
    { id: '5', startTime: '13:00', endTime: '14:00', isBreak: true, label: 'Lunch Break' },
    { id: '6', startTime: '14:00', endTime: '15:00', isBreak: false },
    { id: '7', startTime: '15:00', endTime: '16:00', isBreak: false },
  ]);
  const [selectedDays, setSelectedDays] = useState<Day[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addSubject = () => {
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: '',
      teacher: '',
      weeklyHours: 3,
      difficulty: 'Medium',
      color: colors[subjects.length % colors.length]
    };
    setSubjects([...subjects, newSubject]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const addTimeSlot = () => {
    const lastSlot = timeSlots[timeSlots.length - 1];
    const newSlot: TimeSlot = {
      id: crypto.randomUUID(),
      startTime: lastSlot ? lastSlot.endTime : '09:00',
      endTime: lastSlot ? `${parseInt(lastSlot.endTime.split(':')[0]) + 1}:00` : '10:00',
      isBreak: false
    };
    setTimeSlots([...timeSlots, newSlot]);
  };

  const updateTimeSlot = (id: string, updates: Partial<TimeSlot>) => {
    setTimeSlots(timeSlots.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(s => s.id !== id));
  };

  const handleGenerate = async () => {
    if (subjects.length === 0) return;
    setIsGenerating(true);
    
    // Simulate complex calculation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const config: ScheduleConfig = {
      days: selectedDays,
      timeSlots,
      subjects
    };
    
    const scheduler = new Scheduler(config);
    const result = scheduler.generate();
    setTimetable(result);
    setIsGenerating(false);
    setStep(4);
  };

  const handleSave = async () => {
    if (!timetable || !auth.currentUser) return;
    setIsSaving(true);
    const path = 'timetables';
    try {
      await addDoc(collection(db, path), {
        ...timetable,
        userId: auth.currentUser.uid,
        createdAt: Date.now()
      });
      alert('Timetable saved successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Generate Timetable</h1>
          <p className="text-zinc-500">Step {step} of 4: {
            step === 1 ? 'Configure Subjects' : 
            step === 2 ? 'Set Time Slots' : 
            step === 3 ? 'Select Days' : 'Review Schedule'
          }</p>
        </div>
        
        <div className="flex gap-2">
          {step > 1 && step < 4 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </button>
          )}
          {step < 3 && (
            <button 
              onClick={() => setStep(step + 1)}
              className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          )}
          {step === 3 && (
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate Schedule
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Subject Name</th>
                    <th className="px-6 py-3 font-semibold">Teacher</th>
                    <th className="px-6 py-3 font-semibold">Weekly Hours</th>
                    <th className="px-6 py-3 font-semibold">Difficulty</th>
                    <th className="px-6 py-3 font-semibold">Color</th>
                    <th className="px-6 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          value={subject.name}
                          onChange={(e) => updateSubject(subject.id, { name: e.target.value })}
                          placeholder="e.g. Mathematics"
                          className="w-full rounded-md border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          value={subject.teacher}
                          onChange={(e) => updateSubject(subject.id, { teacher: e.target.value })}
                          placeholder="e.g. Dr. Smith"
                          className="w-full rounded-md border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          value={subject.weeklyHours}
                          onChange={(e) => updateSubject(subject.id, { weeklyHours: parseInt(e.target.value) || 0 })}
                          className="w-20 rounded-md border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={subject.difficulty}
                          onChange={(e) => updateSubject(subject.id, { difficulty: e.target.value as any })}
                          className="rounded-md border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="color" 
                          value={subject.color}
                          onChange={(e) => updateSubject(subject.id, { color: e.target.value })}
                          className="h-8 w-8 rounded-md border-0 p-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => removeSubject(subject.id)} className="text-zinc-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {subjects.length === 0 && (
                <div className="p-12 text-center text-zinc-500">
                  No subjects added yet. Click the button below to start.
                </div>
              )}
            </div>
            <button 
              onClick={addSubject}
              className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 p-4 text-sm font-medium text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Subject
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Start Time</th>
                    <th className="px-6 py-3 font-semibold">End Time</th>
                    <th className="px-6 py-3 font-semibold">Type</th>
                    <th className="px-6 py-3 font-semibold">Label (Optional)</th>
                    <th className="px-6 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {timeSlots.map((slot) => (
                    <tr key={slot.id} className={slot.isBreak ? "bg-zinc-50/50" : ""}>
                      <td className="px-6 py-4">
                        <input 
                          type="time" 
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(slot.id, { startTime: e.target.value })}
                          className="rounded-md border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="time" 
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(slot.id, { endTime: e.target.value })}
                          className="rounded-md border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center">
                            <input 
                              type="radio" 
                              checked={!slot.isBreak}
                              onChange={() => updateTimeSlot(slot.id, { isBreak: false })}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2">Lecture</span>
                          </label>
                          <label className="flex items-center">
                            <input 
                              type="radio" 
                              checked={slot.isBreak}
                              onChange={() => updateTimeSlot(slot.id, { isBreak: true })}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2">Break</span>
                          </label>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          value={slot.label || ''}
                          onChange={(e) => updateTimeSlot(slot.id, { label: e.target.value })}
                          placeholder="e.g. Lunch"
                          disabled={!slot.isBreak}
                          className="w-full rounded-md border-zinc-200 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-zinc-50"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => removeTimeSlot(slot.id)} className="text-zinc-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button 
              onClick={addTimeSlot}
              className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 p-4 text-sm font-medium text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Time Slot
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {DAYS.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDays(selectedDays.filter(d => d !== day));
                      } else {
                        setSelectedDays([...selectedDays, day]);
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-2xl border p-6 transition-all",
                      isSelected 
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600 ring-offset-2" 
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                    )}
                  >
                    <span className="text-lg font-bold">{day.substring(0, 3)}</span>
                    <span className="text-xs mt-1">{day}</span>
                    {isSelected && <Check className="mt-2 h-4 w-4" />}
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-amber-800">Scheduling Strategy</h3>
                <p className="text-xs text-amber-700 mt-1">
                  We'll prioritize difficult subjects in the morning slots and ensure an even distribution across your selected {selectedDays.length} days.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && timetable && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Generated Schedule</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
                >
                  Edit Configuration
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save to History
                </button>
              </div>
            </div>
            
            <TimetableGrid timetable={timetable} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
