import { BarChart3, CalendarCheck, CreditCard, GraduationCap, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuthStore } from '../store/authStore';
import { useSchoolStore } from '../store/schoolStore';
import type { SectionKey } from './ManagementPages';

const attendance = [
  { name: 'Mon', present: 92 },
  { name: 'Tue', present: 95 },
  { name: 'Wed', present: 90 },
  { name: 'Thu', present: 94 },
  { name: 'Fri', present: 91 }
];

const compactRupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  notation: 'compact'
});

const statNav: Array<{ label: string; icon: typeof GraduationCap; section: SectionKey; color: string }> = [
  { label: 'Students', icon: GraduationCap, section: 'Students', color: 'text-cedar' },
  { label: 'Teachers', icon: Users, section: 'Teachers', color: 'text-cedar' },
  { label: 'Attendance', icon: CalendarCheck, section: 'Attendance', color: 'text-cedar' },
  { label: 'Fees Collected', icon: CreditCard, section: 'Fees', color: 'text-cedar' }
];

export function DashboardPage({ onNavigate }: { onNavigate?: (section: SectionKey) => void }) {
  const user = useAuthStore((state) => state.user);
  const students = useSchoolStore((state) => state.students);
  const teachers = useSchoolStore((state) => state.teachers);
  const averageAttendance = students.length
    ? Math.round(students.reduce((total, student) => total + student.attendance, 0) / students.length)
    : 0;
  const feesCollected = students.reduce((total, student) => total + student.amountPaid, 0);
  const stats = [
    { label: 'Students', value: String(students.length), icon: GraduationCap, section: 'Students' as SectionKey },
    { label: 'Teachers', value: String(teachers.length), icon: Users, section: 'Teachers' as SectionKey },
    { label: 'Attendance', value: `${averageAttendance}%`, icon: CalendarCheck, section: 'Attendance' as SectionKey },
    { label: 'Fees Collected', value: compactRupee.format(feesCollected), icon: CreditCard, section: 'Fees' as SectionKey }
  ];

  return (
      <div className="space-y-6">
        <section className="flex flex-col justify-between gap-4 rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-black/55 dark:text-gray-400">Welcome back</p>
            <h2 className="mt-1 text-2xl font-semibold dark:text-gray-100">{user?.fullName}</h2>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-mist px-3 py-2 text-sm text-black/65 dark:bg-gray-700 dark:text-gray-300">
            <BarChart3 size={17} />
            Current academic year 2026
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate?.(item.section)}
              className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5 text-left transition hover:shadow-md hover:border-cedar/30"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-black/55 dark:text-gray-400">{item.label}</p>
                <item.icon size={19} className="text-cedar" />
              </div>
              <p className="mt-4 text-3xl font-semibold">{item.value}</p>
            </button>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <article className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5">
            <h3 className="font-semibold">Weekly Attendance</h3>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="present" fill="#28645c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5">
            <h3 className="font-semibold">Role Dashboard</h3>
            <div className="mt-4 space-y-3 text-sm">
              {(user?.roles ?? []).map((role) => (
                <div key={role} className="rounded-md border border-black/10 dark:border-gray-700 p-3">
                  <p className="font-medium">{role}</p>
                  <p className="mt-1 text-black/55 dark:text-gray-400">{roleCopy(role)}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
  );
}

function roleCopy(role: string) {
  if (role === 'ADMIN') return 'Manage users, classes, fees, reports, and school settings.';
  if (role === 'TEACHER') return 'Take attendance, manage classes, and enter marks.';
  if (role === 'STUDENT') return 'View attendance, fees, exam results, and notifications.';
  return 'Support operations, fee collection, and communications.';
}
