import React from 'react';
import ReactDOM from 'react-dom/client';
import { useEffect, useState } from 'react';
import { Loader2, XCircle } from 'lucide-react';
import './index.css';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { AttendancePage, DocumentsPage, ExamsPage, FeesPage, NotificationsPage, SectionKey, StudentItemsPage, StudentsPage, TeachersPage } from './pages/ManagementPages';
import { useAuthStore } from './store/authStore';
import { useSchoolStore } from './store/schoolStore';

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  const bg = type === 'success' ? 'bg-emerald-600 dark:bg-emerald-700' : 'bg-rosewood';
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg ${bg} px-5 py-3 text-sm font-medium text-white shadow-lg`}>
      {message}
      <button onClick={onClose} className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/20"><XCircle size={15} /></button>
    </div>
  );
}

function App() {
  const token = useAuthStore((state) => state.token);
  const { isLoading, error, loadManagementData } = useSchoolStore();
  const [activeSection, setActiveSection] = useState<SectionKey>('Dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (token) {
      void loadManagementData();
    }
  }, [loadManagementData, token]);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
  }

  if (!token) return <LoginPage />;

  const section = () => {
    switch (activeSection) {
      case 'Dashboard': return <DashboardPage onNavigate={(s) => setActiveSection(s)} />;
      case 'Students': return <StudentsPage onToast={showToast} />;
      case 'Teachers': return <TeachersPage onToast={showToast} />;
      case 'Attendance': return <AttendancePage />;
      case 'Fees': return <FeesPage />;
      case 'Exams': return <ExamsPage onToast={showToast} />;
      case 'Notifications': return <NotificationsPage onToast={showToast} />;
      case 'Student Items': return <StudentItemsPage onToast={showToast} />;
      case 'Documents': return <DocumentsPage onToast={showToast} />;
    }
  };

  return (
    <AppShell activeSection={activeSection} onSectionChange={setActiveSection}>
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-black/55 dark:text-gray-400">
            <Loader2 size={22} className="animate-spin text-cedar dark:text-emerald-400" />
            <span className="text-sm">Loading data…</span>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded-lg border border-amberline/30 bg-amberline/5 px-4 py-2 text-sm text-amberline dark:border-yellow-600/30 dark:bg-yellow-900/20 dark:text-yellow-400">
              {error}
            </div>
          )}
          {section()}
        </>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppShell>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
