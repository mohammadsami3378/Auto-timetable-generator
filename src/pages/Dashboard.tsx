import { User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, Plus, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface DashboardProps {
  user: User | null;
}

export default function Dashboard({ user }: DashboardProps) {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const stats = [
    { label: 'Smart Scheduling', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Conflict Resolution', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Teacher Management', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Time Optimization', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl"
        >
          Generate your perfect <br />
          <span className="text-indigo-600">academic timetable</span> in seconds.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-lg text-zinc-600 max-w-2xl"
        >
          AutoSched uses advanced constraint-based algorithms to distribute subjects, avoid teacher conflicts, and respect your breaks.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          {user ? (
            <Link
              to="/generate"
              className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Timetable
            </Link>
          ) : (
            <button
              onClick={handleLogin}
              className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all"
            >
              Get Started for Free
            </button>
          )}
          <Link
            to="/history"
            className="inline-flex items-center rounded-full bg-white px-6 py-3 text-base font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 transition-all"
          >
            View History
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm"
          >
            <div className={cn("mb-4 rounded-full p-3", stat.bg)}>
              <stat.icon className={cn("h-6 w-6", stat.color)} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">{stat.label}</h3>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-zinc-900 p-8 text-white md:p-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <ul className="mt-6 space-y-4">
              {[
                "Input your subjects, teachers, and weekly hours.",
                "Define your available days and time slots.",
                "Set your break times (like lunch or recess).",
                "Our AI engine generates the most optimal schedule.",
                "Download as PDF or save for later."
              ].map((step, i) => (
                <li key={i} className="flex items-start">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="ml-4 text-zinc-400">{step}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-4 flex items-center justify-center">
              <Calendar className="h-32 w-32 text-indigo-500 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-2 w-48">
                  {[...Array(9)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: i * 0.2 
                      }}
                      className="h-8 rounded-md bg-indigo-500/40"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
