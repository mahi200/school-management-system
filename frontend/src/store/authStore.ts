import { create } from 'zustand';

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'STAFF';

export interface UserProfile {
  id: string;
  schoolId: string;
  schoolCode: string;
  fullName: string;
  email: string;
  roles: Role[];
  status: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  setSession: (token: string, user: UserProfile) => void;
  logout: () => void;
}

const savedToken = localStorage.getItem('sms.token');
const savedUser = localStorage.getItem('sms.user');

export const useAuthStore = create<AuthState>((set) => ({
  token: savedToken,
  user: savedUser ? JSON.parse(savedUser) as UserProfile : null,
  setSession: (token, user) => {
    localStorage.setItem('sms.token', token);
    localStorage.setItem('sms.user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('sms.token');
    localStorage.removeItem('sms.user');
    set({ token: null, user: null });
  }
}));

