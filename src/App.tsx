import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './services/firebase';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [jwtUser, setJwtUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for JWT user in localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        setJwtUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    // Check for Firebase user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const currentUser = firebaseUser || jwtUser;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout user={currentUser} />}>
          <Route path="/" element={<Dashboard user={currentUser} />} />
          <Route path="/generate" element={currentUser ? <Generate /> : <Navigate to="/login" />} />
          <Route path="/history" element={currentUser ? <History /> : <Navigate to="/login" />} />
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}
