import { Bell, BookOpen, CalendarCheck, CreditCard, FileText, GraduationCap, LayoutDashboard, LogOut, Moon, Package, Sun, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { SectionKey } from '../pages/ManagementPages';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Students', icon: GraduationCap },
  { label: 'Teachers', icon: Users },
  { label: 'Attendance', icon: CalendarCheck },
  { label: 'Fees', icon: CreditCard },
  { label: 'Exams', icon: BookOpen },
  { label: 'Notifications', icon: Bell },
  { label: 'Student Items', icon: Package },
  { label: 'Documents', icon: FileText }
] as Array<{ label: SectionKey; icon: typeof Bell }>;

export function AppShell({ activeSection, onSectionChange, children }: { activeSection: SectionKey; onSectionChange: (section: SectionKey) => void; children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const [dark, setDark] = useState(() => localStorage.getItem('sms.dark') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('sms.dark', String(dark));
  }, [dark]);

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-gray-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 lg:block">
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-cedar text-white">
            <GraduationCap size={21} />
          </div>
          <div>
            <p className="text-sm font-semibold dark:text-gray-100">My Dream Public School</p>
            <p className="text-xs text-black/55 dark:text-gray-400">{user?.schoolCode ?? 'DEMO'}</p>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onSectionChange(item.label)}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm hover:bg-mist hover:text-ink dark:hover:bg-gray-700 dark:hover:text-gray-100 ${activeSection === item.label ? 'bg-mist font-semibold text-cedar dark:bg-gray-700 dark:text-emerald-400' : 'text-black/70 dark:text-gray-400'}`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-black/10 bg-white/95 px-4 backdrop-blur dark:border-gray-700 dark:bg-gray-800/95 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-wide text-black/50 dark:text-gray-400">{user?.roles.join(', ') ?? 'Guest'}</p>
            <h1 className="text-base font-semibold dark:text-gray-100">{activeSection}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDark((prev) => !prev)} className="grid h-10 w-10 place-items-center rounded-md border border-black/10 text-black/70 hover:bg-mist dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" title="Toggle dark mode">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={logout} className="grid h-10 w-10 place-items-center rounded-md border border-black/10 text-black/70 hover:bg-mist dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" title="Log out">
            <LogOut size={18} />
          </button>
          </div>
        </header>
        <nav className="sticky top-16 z-10 flex gap-2 overflow-x-auto border-b border-black/10 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800 lg:hidden">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onSectionChange(item.label)}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              className={`flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm ${activeSection === item.label ? 'bg-mist font-semibold text-cedar dark:bg-gray-700 dark:text-emerald-400' : 'text-black/65 dark:text-gray-400'}`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
