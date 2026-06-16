import { useState } from 'react';
import { BookOpen, Users, DoorOpen, Clock, Calendar, Home } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Teachers from './pages/Teachers';
import Rooms from './pages/Rooms';
import TimeSlots from './pages/TimeSlots';
import Timetable from './pages/Timetable';

type Page = 'dashboard' | 'subjects' | 'teachers' | 'rooms' | 'timeslots' | 'timetable';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: Home },
    { id: 'subjects' as Page, label: 'Subjects', icon: BookOpen },
    { id: 'teachers' as Page, label: 'Teachers', icon: Users },
    { id: 'rooms' as Page, label: 'Rooms', icon: DoorOpen },
    { id: 'timeslots' as Page, label: 'Time Slots', icon: Clock },
    { id: 'timetable' as Page, label: 'Timetable', icon: Calendar },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'subjects':
        return <Subjects />;
      case 'teachers':
        return <Teachers />;
      case 'rooms':
        return <Rooms />;
      case 'timeslots':
        return <TimeSlots />;
      case 'timetable':
        return <Timetable />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="w-64 bg-slate-900 text-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">TimeTable Pro</h1>
              <p className="text-xs text-slate-400">Auto Scheduler</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                currentPage === id
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
          <p>Version 1.0</p>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 capitalize">
              {navItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
            </h2>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
