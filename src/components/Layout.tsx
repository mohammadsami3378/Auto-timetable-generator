import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, History, LayoutDashboard, LogIn, LogOut, PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  user: any;
}

export default function Layout({ user }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Clear Firebase session
    await signOut(auth);
    // Clear JWT session
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to home
    navigate('/');
    window.location.reload();
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Generate', path: '/generate', icon: PlusCircle, protected: true },
    { label: 'History', path: '/history', icon: History, protected: true },
  ];

  const userDisplayName = user?.displayName || user?.name || 'User';
  const userEmail = user?.email || '';
  const userPhoto = user?.photoURL || `https://ui-avatars.com/api/?name=${userDisplayName}&background=random`;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-zinc-200 bg-white md:block">
        <div className="flex h-16 items-center border-b border-zinc-200 px-6">
          <Calendar className="mr-2 h-6 w-6 text-indigo-600" />
          <span className="text-xl font-bold tracking-tight">AutoSched</span>
        </div>
        
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            if (item.protected && !user) return null;
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-zinc-200 p-4">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center overflow-hidden">
                <img 
                  src={userPhoto} 
                  alt={userDisplayName} 
                  className="h-8 w-8 rounded-full border border-zinc-200"
                  referrerPolicy="no-referrer"
                />
                <div className="ml-3 overflow-hidden">
                  <p className="truncate text-xs font-medium">{userDisplayName}</p>
                  <p className="truncate text-[10px] text-zinc-500">{userEmail}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md md:hidden">
          <div className="flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold tracking-tight">AutoSched</span>
          </div>
          {user ? (
             <img 
              src={userPhoto} 
              alt={userDisplayName} 
              className="h-8 w-8 rounded-full border border-zinc-200"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Link to="/login" className="text-sm font-medium text-indigo-600">Sign In</Link>
          )}
        </header>

        <div className="p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
