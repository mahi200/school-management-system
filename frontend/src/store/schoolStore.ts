import { create } from 'zustand';
import { api } from '../lib/api';

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  parentName: string;
  guardianPhone: string;
  guardianEmail: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  className: string;
  section: string;
  attendance: number;
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
  annualFee: number;
  amountPaid: number;
}

export interface Teacher {
  id: string;
  employeeNo: string;
  name: string;
  subject: string;
  classes: string;
  phone: string;
  email: string;
  qualification: string;
  joiningDate: string;
}

export interface ExamRecord {
  id: string;
  name: string;
  className: string;
  status: string;
  resultCards: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  className: string;
  person: string;
  status: string;
}

export interface StudentItem {
  id: string;
  studentId: string;
  studentName: string;
  studentAdmissionNo: string;
  className: string;
  itemName: string;
  itemType: string;
  quantity: number;
  providedDate: string;
  notes: string;
  status: 'Issued' | 'Returned';
}

export interface DocumentRecord {
  id: string;
  ownerType: string;
  ownerName: string;
  ownerIdentifier: string;
  documentTitle: string;
  documentType: string;
  notes: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

interface SchoolState {
  students: Student[];
  teachers: Teacher[];
  exams: ExamRecord[];
  notifications: NotificationRecord[];
  studentItems: StudentItem[];
  documents: DocumentRecord[];
  isLoading: boolean;
  error: string | null;
  loadManagementData: () => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  updateStudentAttendance: (id: string, attendance: number) => void;
  recordFeePayment: (id: string, amount: number) => void;
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  updateExam: (id: string, updates: Omit<ExamRecord, 'id'>) => void;
  addExam: (exam: Omit<ExamRecord, 'id'>) => void;
  updateNotification: (id: string, updates: Omit<NotificationRecord, 'id'>) => void;
  addNotification: (notification: Omit<NotificationRecord, 'id'>) => void;
  deleteStudent: (id: string) => void;
  deleteTeacher: (id: string) => void;
  deleteExam: (id: string) => void;
  deleteNotification: (id: string) => void;
  addStudentItem: (item: Omit<StudentItem, 'id' | 'studentName' | 'studentAdmissionNo' | 'className'>) => void;
  updateStudentItem: (id: string, updates: Omit<StudentItem, 'id' | 'studentId' | 'studentName' | 'studentAdmissionNo' | 'className'>) => void;
  deleteStudentItem: (id: string) => void;
  uploadDocument: (document: {
    ownerType: string;
    ownerName: string;
    ownerIdentifier: string;
    documentTitle: string;
    documentType: string;
    notes: string;
    file: File;
  }) => Promise<void>;
  deleteDocument: (id: string) => void;
  downloadDocument: (document: DocumentRecord) => Promise<void>;
}

const initialStudents: Student[] = [
  { id: 'stu-1', admissionNo: 'ADM-1001', name: 'Aarav Mehta', parentName: 'Rohit Mehta', guardianPhone: '+91 98765 11111', guardianEmail: 'rohit.mehta@email.com', dateOfBirth: '2012-05-15', gender: 'Male', address: '12 Nehru Nagar, Jaipur', className: 'Class 8', section: 'A', attendance: 96, feeStatus: 'Paid', annualFee: 54000, amountPaid: 54000 },
  { id: 'stu-2', admissionNo: 'ADM-1002', name: 'Nisha Rao', parentName: 'Meera Rao', guardianPhone: '+91 98765 22222', guardianEmail: 'meera.rao@email.com', dateOfBirth: '2012-09-20', gender: 'Female', address: '45 Lakshmi Road, Pune', className: 'Class 8', section: 'B', attendance: 91, feeStatus: 'Pending', annualFee: 54000, amountPaid: 30000 },
  { id: 'stu-3', admissionNo: 'ADM-1003', name: 'Kabir Shah', parentName: 'Amit Shah', guardianPhone: '+91 98765 33333', guardianEmail: 'amit.shah@email.com', dateOfBirth: '2011-03-10', gender: 'Male', address: '8 MG Road, Ahmedabad', className: 'Class 9', section: 'A', attendance: 88, feeStatus: 'Overdue', annualFee: 62400, amountPaid: 24000 },
  { id: 'stu-4', admissionNo: 'ADM-1004', name: 'Sara Khan', parentName: 'Farah Khan', guardianPhone: '+91 98765 44444', guardianEmail: 'farah.khan@email.com', dateOfBirth: '2010-11-25', gender: 'Female', address: '21 Park Street, Kolkata', className: 'Class 10', section: 'C', attendance: 94, feeStatus: 'Paid', annualFee: 69600, amountPaid: 69600 },
  { id: 'stu-5', admissionNo: 'ADM-1005', name: 'Ishaan Patel', parentName: 'Bhavesh Patel', guardianPhone: '+91 98765 55555', guardianEmail: 'bhavesh.patel@email.com', dateOfBirth: '2009-07-08', gender: 'Male', address: '77 Satellite Road, Ahmedabad', className: 'Class 11', section: 'Science', attendance: 89, feeStatus: 'Pending', annualFee: 86400, amountPaid: 43200 }
];

const initialTeachers: Teacher[] = [
  { id: 'tch-1', employeeNo: 'EMP-201', name: 'Priya Menon', subject: 'Mathematics', classes: 'Class 8A, Class 9A', phone: '+91 98765 01010', email: 'priya.menon@school.edu', qualification: 'M.Sc. Mathematics', joiningDate: '2019-06-01' },
  { id: 'tch-2', employeeNo: 'EMP-202', name: 'Rahul Verma', subject: 'Physics', classes: 'Class 9A, Class 10C', phone: '+91 98765 02020', email: 'rahul.verma@school.edu', qualification: 'M.Sc. Physics', joiningDate: '2020-07-15' },
  { id: 'tch-3', employeeNo: 'EMP-203', name: 'Anita Das', subject: 'English', classes: 'Class 8B, Class 10C', phone: '+91 98765 03030', email: 'anita.das@school.edu', qualification: 'M.A. English', joiningDate: '2018-04-10' },
  { id: 'tch-4', employeeNo: 'EMP-204', name: 'Sandeep Iyer', subject: 'Accountancy', classes: 'Class 11 Commerce, Class 12 Commerce', phone: '+91 98765 04040', email: 'sandeep.iyer@school.edu', qualification: 'M.Com, CA', joiningDate: '2017-08-20' }
];

const initialExams: ExamRecord[] = [
  { id: 'exam-1', name: 'Half Yearly', className: 'Class 8', status: 'Marks entry open', resultCards: '42 generated' },
  { id: 'exam-2', name: 'Unit Test 2', className: 'Class 9', status: 'Scheduled', resultCards: 'Pending' },
  { id: 'exam-3', name: 'Pre-Board Practical', className: 'Class 10', status: 'Draft', resultCards: 'Pending' },
  { id: 'exam-4', name: 'Commerce Term Exam', className: 'Class 11', status: 'Published', resultCards: '36 generated' }
];

const initialNotifications: NotificationRecord[] = [
  { id: 'note-1', title: 'Fee reminder to Class 8B', className: 'Class 8', person: 'Nisha Rao', status: 'Queued for SMS and email' },
  { id: 'note-2', title: 'Attendance alert to guardians', className: 'Class 9', person: 'Kabir Shah', status: 'Sent today' },
  { id: 'note-3', title: 'Exam schedule published', className: 'Class 10', person: 'Sara Khan', status: 'In-app notification active' },
  { id: 'note-4', title: 'Transport fee reminder', className: 'Class 11', person: 'Ishaan Patel', status: 'Queued for SMS' }
];

const initialStudentItems: StudentItem[] = [
  { id: 'item-1', studentId: 'stu-1', studentName: 'Aarav Mehta', studentAdmissionNo: 'ADM-1001', className: 'Class 8', itemName: 'Mathematics Textbook', itemType: 'Book', quantity: 1, providedDate: '2025-04-01', notes: 'Class 8 syllabus edition', status: 'Issued' },
  { id: 'item-2', studentId: 'stu-2', studentName: 'Nisha Rao', studentAdmissionNo: 'ADM-1002', className: 'Class 8', itemName: 'Summer Uniform Set', itemType: 'Dress', quantity: 2, providedDate: '2025-04-05', notes: 'Shirt and skirt', status: 'Issued' },
  { id: 'item-3', studentId: 'stu-3', studentName: 'Kabir Shah', studentAdmissionNo: 'ADM-1003', className: 'Class 9', itemName: 'Science Lab Manual', itemType: 'Book', quantity: 1, providedDate: '2025-04-10', notes: '', status: 'Issued' },
  { id: 'item-4', studentId: 'stu-4', studentName: 'Sara Khan', studentAdmissionNo: 'ADM-1004', className: 'Class 10', itemName: 'Winter Blazer', itemType: 'Dress', quantity: 1, providedDate: '2025-11-15', notes: 'Size M', status: 'Issued' }
];

const initialDocuments: DocumentRecord[] = [];

export const useSchoolStore = create<SchoolState>((set) => ({
  students: initialStudents,
  teachers: initialTeachers,
  exams: initialExams,
  notifications: initialNotifications,
  studentItems: initialStudentItems,
  documents: initialDocuments,
  isLoading: false,
  error: null,
  loadManagementData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Pick<SchoolState, 'students' | 'teachers' | 'exams' | 'notifications' | 'studentItems' | 'documents'>>('/management/snapshot');
      set({
        students: normalizeStudents(data.students),
        teachers: data.teachers,
        exams: data.exams,
        notifications: data.notifications,
        studentItems: data.studentItems ?? [],
        documents: data.documents ?? [],
        isLoading: false
      });
    } catch {
      set({ isLoading: false, error: 'Using local sample data until backend is available.' });
    }
  },
  addStudent: (student) => {
    void api.post<Student>('/management/students', student)
      .then(({ data }) => set((state) => ({ students: [normalizeStudent(data), ...state.students] })))
      .catch(() => set((state) => ({ students: [{ ...student, id: `stu-${Date.now()}` }, ...state.students] })));
  },
  updateStudent: (id, updates) => {
    set((state) => ({
    students: state.students.map((student) => {
      if (student.id !== id) return student;
      const next = { ...student, ...updates };
      const due = Math.max(next.annualFee - next.amountPaid, 0);
      const feeStatus = due === 0 ? 'Paid' : due > next.annualFee * 0.5 ? 'Overdue' : 'Pending';
      return { ...next, feeStatus };
    })
  }));
    const current = useSchoolStore.getState().students.find((student) => student.id === id);
    if (!current) return;
    void api.put<Student>(`/management/students/${id}`, {
      name: updates.name ?? current.name,
      parentName: updates.parentName ?? current.parentName,
      guardianPhone: updates.guardianPhone ?? current.guardianPhone,
      guardianEmail: updates.guardianEmail ?? current.guardianEmail,
      dateOfBirth: updates.dateOfBirth ?? current.dateOfBirth,
      gender: updates.gender ?? current.gender,
      address: updates.address ?? current.address,
      className: updates.className ?? current.className,
      section: updates.section ?? current.section,
      annualFee: updates.annualFee ?? current.annualFee,
      amountPaid: updates.amountPaid ?? current.amountPaid
    }).then(({ data }) => replaceStudent(data));
  },
  updateStudentAttendance: (id, attendance) => {
    set((state) => ({
      students: state.students.map((student) => student.id === id ? { ...student, attendance } : student)
    }));
    void api.patch<Student>(`/management/students/${id}/attendance`, { attendance }).then(({ data }) => replaceStudent(data));
  },
  recordFeePayment: (id, amount) => {
    set((state) => ({
      students: state.students.map((student) => {
      if (student.id !== id) return student;
      const nextPaid = Math.min(student.amountPaid + Math.max(amount, 0), student.annualFee);
      const due = Math.max(student.annualFee - nextPaid, 0);
      const feeStatus = due === 0 ? 'Paid' : due > student.annualFee * 0.5 ? 'Overdue' : 'Pending';
      return { ...student, amountPaid: nextPaid, feeStatus };
    })
  }));
    void api.post<Student>(`/management/students/${id}/payments`, { amount }).then(({ data }) => replaceStudent(data));
  },
  addTeacher: (teacher) => {
    void api.post<Teacher>('/management/teachers', teacher)
      .then(({ data }) => set((state) => ({ teachers: [data, ...state.teachers] })))
      .catch(() => set((state) => ({ teachers: [{ ...teacher, id: `tch-${Date.now()}` }, ...state.teachers] })));
  },
  updateTeacher: (id, updates) => {
    set((state) => ({
    teachers: state.teachers.map((teacher) => teacher.id === id ? { ...teacher, ...updates } : teacher)
  }));
    const current = useSchoolStore.getState().teachers.find((teacher) => teacher.id === id);
    if (!current) return;
    void api.put<Teacher>(`/management/teachers/${id}`, {
      employeeNo: updates.employeeNo ?? current.employeeNo,
      name: updates.name ?? current.name,
      subject: updates.subject ?? current.subject,
      classes: updates.classes ?? current.classes,
      phone: updates.phone ?? current.phone,
      email: updates.email ?? current.email,
      qualification: updates.qualification ?? current.qualification,
      joiningDate: updates.joiningDate ?? current.joiningDate
    }).then(({ data }) => set((state) => ({ teachers: state.teachers.map((teacher) => teacher.id === data.id ? data : teacher) })));
  },
  updateExam: (id, updates) => {
    set((state) => ({
      exams: state.exams.map((exam) => exam.id === id ? { ...exam, ...updates } : exam)
    }));
    void api.put<ExamRecord>(`/management/exams/${id}`, updates).catch(() => {});
  },
  addExam: (exam) => {
    void api.post<ExamRecord>('/management/exams', exam)
      .then(({ data }) => set((state) => ({ exams: [data, ...state.exams] })))
      .catch(() => set((state) => ({ exams: [{ ...exam, id: `exam-${Date.now()}` }, ...state.exams] })));
  },
  updateNotification: (id, updates) => {
    set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, ...updates } : n)
    }));
    void api.put<NotificationRecord>(`/management/notifications/${id}`, updates).catch(() => {});
  },
  addNotification: (notification) => {
    void api.post<NotificationRecord>('/management/notifications', notification)
      .then(({ data }) => set((state) => ({ notifications: [data, ...state.notifications] })))
      .catch(() => set((state) => ({ notifications: [{ ...notification, id: `note-${Date.now()}` }, ...state.notifications] })));
  },
  deleteStudent: (id) => {
    set((state) => ({ students: state.students.filter((s) => s.id !== id) }));
    void api.delete(`/management/students/${id}`).catch(() => {});
  },
  deleteTeacher: (id) => {
    set((state) => ({ teachers: state.teachers.filter((t) => t.id !== id) }));
    void api.delete(`/management/teachers/${id}`).catch(() => {});
  },
  deleteExam: (id) => {
    set((state) => ({ exams: state.exams.filter((e) => e.id !== id) }));
    void api.delete(`/management/exams/${id}`).catch(() => {});
  },
  deleteNotification: (id) => {
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) }));
    void api.delete(`/management/notifications/${id}`).catch(() => {});
  },
  addStudentItem: (item) => {
    void api.post<StudentItem>('/management/student-items', item)
      .then(({ data }) => set((state) => ({ studentItems: [data, ...state.studentItems] })))
      .catch(() => {
        const student = useSchoolStore.getState().students.find((s) => s.id === item.studentId);
        set((state) => ({
          studentItems: [{
            ...item,
            id: `item-${Date.now()}`,
            studentName: student?.name ?? 'Unknown',
            studentAdmissionNo: student?.admissionNo ?? '',
            className: student?.className ?? ''
          }, ...state.studentItems]
        }));
      });
  },
  updateStudentItem: (id, updates) => {
    set((state) => ({
      studentItems: state.studentItems.map((item) => item.id === id ? { ...item, ...updates } : item)
    }));
    void api.put<StudentItem>(`/management/student-items/${id}`, updates).catch(() => {});
  },
  deleteStudentItem: (id) => {
    set((state) => ({ studentItems: state.studentItems.filter((item) => item.id !== id) }));
    void api.delete(`/management/student-items/${id}`).catch(() => {});
  },
  uploadDocument: async (document) => {
    const formData = new FormData();
    formData.append('ownerType', document.ownerType);
    formData.append('ownerName', document.ownerName);
    formData.append('ownerIdentifier', document.ownerIdentifier);
    formData.append('documentTitle', document.documentTitle);
    formData.append('documentType', document.documentType);
    formData.append('notes', document.notes);
    formData.append('file', document.file);
    const { data } = await api.post<DocumentRecord>('/management/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    set((state) => ({ documents: [data, ...state.documents] }));
  },
  deleteDocument: (id) => {
    set((state) => ({ documents: state.documents.filter((document) => document.id !== id) }));
    void api.delete(`/management/documents/${id}`).catch(() => {});
  },
  downloadDocument: async (document) => {
    const { data } = await api.get<Blob>(`/management/documents/${document.id}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(data);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}));

function normalizeStudents(students: Student[]) {
  return students.map(normalizeStudent);
}

function normalizeStudent(student: Student) {
  return {
    ...student,
    annualFee: Number(student.annualFee),
    amountPaid: Number(student.amountPaid)
  };
}

function replaceStudent(student: Student) {
  const normalized = normalizeStudent(student);
  useSchoolStore.setState((state) => ({
    students: state.students.map((item) => item.id === normalized.id ? normalized : item)
  }));
}
