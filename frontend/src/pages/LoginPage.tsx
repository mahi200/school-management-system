import { FormEvent, useState } from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const setSession = useAuthStore((state) => state.setSession);
  const [schoolCode, setSchoolCode] = useState('DEMO');
  const [email, setEmail] = useState('admin@demo.school');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { schoolCode, email, password });
      setSession(data.accessToken, data.user);
    } catch {
      setError('Check the school code, email, and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f6f8f7] dark:bg-gray-900 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex min-h-[42vh] flex-col justify-between bg-cedar p-8 text-white lg:min-h-screen lg:p-12">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-white/15">
            <GraduationCap size={24} />
          </div>
          <span className="font-semibold">My Dream Public School</span>
        </div>
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Run academics, attendance, fees, and communication from one school workspace.</h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/78">Multi-school ready, role aware, and built on open-source infrastructure.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-white/80">
          <span>JWT Auth</span>
          <span>Kafka Events</span>
          <span>MinIO Files</span>
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-black/10 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold dark:text-gray-100">Sign in</h2>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium dark:text-gray-300">
              School code
              <input value={schoolCode} onChange={(event) => setSchoolCode(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-black/15 px-3 outline-none focus:border-cedar dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" required />
            </label>
            <label className="block text-sm font-medium dark:text-gray-300">
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-black/15 px-3 outline-none focus:border-cedar dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" required />
            </label>
            <label className="block text-sm font-medium dark:text-gray-300">
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-black/15 px-3 outline-none focus:border-cedar dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" required />
            </label>
          </div>
          {error && <p className="mt-4 rounded-md bg-rosewood/10 px-3 py-2 text-sm text-rosewood">{error}</p>}
          <button disabled={loading} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-cedar px-4 text-sm font-semibold text-white hover:bg-[#20544d] disabled:opacity-70">
            {loading && <Loader2 size={17} className="animate-spin" />}
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}

