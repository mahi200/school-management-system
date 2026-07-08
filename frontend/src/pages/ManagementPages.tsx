import { FormEvent, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Bell, BookOpen, CalendarCheck, Check, CreditCard, Download, FileText, IndianRupee, Package, Pencil, Plus, ReceiptText, Search, Send, Trash2, UserRoundPlus, X } from 'lucide-react';
import { DocumentRecord, Student, StudentItem, Teacher, useSchoolStore } from '../store/schoolStore';

export type SectionKey = 'Dashboard' | 'Students' | 'Teachers' | 'Attendance' | 'Fees' | 'Exams' | 'Notifications' | 'Student Items' | 'Documents';

const classOptions = ['All classes', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const editableClassOptions = classOptions.slice(1);
const itemTypeOptions = ['Book', 'Dress', 'Uniform', 'Stationery', 'Sports Kit', 'Other'];
const itemStatusOptions: StudentItem['status'][] = ['Issued', 'Returned'];
const ownerTypeOptions = ['Student', 'Teacher', 'Staff', 'Parent', 'Other'];
const documentTypeOptions = ['Admission Form', 'Aadhaar', 'Birth Certificate', 'Transfer Certificate', 'Photo', 'Qualification', 'Experience Letter', 'Medical', 'Other'];
const annualFeeDefaults: Record<string, number> = {
  'Class 8': 54000, 'Class 9': 62400, 'Class 10': 69600, 'Class 11': 86400, 'Class 12': 86400
};

const rupee = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0
});

// ── Students ──────────────────────────────────────────────
export function StudentsPage({ onToast }: { onToast?: (msg: string, type?: 'success' | 'error') => void }) {
  const { students, addStudent, updateStudent, deleteStudent } = useSchoolStore();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All classes');
  // Add form
  const [name, setName] = useState('');
  const [parentName, setParentName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [className, setClassName] = useState('Class 8');
  const [section, setSection] = useState('A');
  const [annualFee, setAnnualFee] = useState(String(annualFeeDefaults['Class 8']));
  const [amountPaid, setAmountPaid] = useState('0');
  // Edit form - ALL fields
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editGuardianPhone, setEditGuardianPhone] = useState('');
  const [editGuardianEmail, setEditGuardianEmail] = useState('');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [editGender, setEditGender] = useState('Male');
  const [editAddress, setEditAddress] = useState('');
  const [editClassName, setEditClassName] = useState('Class 8');
  const [editSection, setEditSection] = useState('A');
  const [editAnnualFee, setEditAnnualFee] = useState('62400');
  const [editAmountPaid, setEditAmountPaid] = useState('0');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const selectedStudent = students.find((s) => s.id === editId);

  const filtered = useMemo(() => students.filter((s) =>
    matchesSearch([s.name, s.parentName, s.address, s.admissionNo, s.className, s.section, s.feeStatus], query)
    && matchesClass(s.className, classFilter)
  ), [classFilter, query, students]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    const decidedFee = Number(annualFee);
    const paidFee = Number(amountPaid);
    if (!Number.isFinite(decidedFee) || decidedFee <= 0 || !Number.isFinite(paidFee) || paidFee < 0) return;
    const safePaidFee = Math.min(paidFee, decidedFee);
    const due = Math.max(decidedFee - safePaidFee, 0);
    addStudent({
      admissionNo: `ADM-${1000 + students.length + 1}`,
      name: name.trim(), parentName: parentName.trim() || 'Parent details pending',
      guardianPhone, guardianEmail, dateOfBirth, gender,
      address: address.trim() || 'Address pending',
      className, section, attendance: 100,
      feeStatus: due === 0 ? 'Paid' : due > decidedFee * 0.5 ? 'Overdue' : 'Pending',
      annualFee: decidedFee, amountPaid: safePaidFee
    });
    setName(''); setParentName(''); setGuardianPhone(''); setGuardianEmail(''); setDateOfBirth(''); setGender('Male');
    setAddress(''); setAmountPaid('0');
    onToast?.('Student added successfully');
  }

  function updateNewStudentClass(next: string) { setClassName(next); setAnnualFee(String(annualFeeDefaults[next] ?? annualFeeDefaults['Class 8'])); }

  function startEdit(studentId: string) {
    const s = students.find((item) => item.id === studentId);
    if (!s) return;
    setEditId(s.id); setEditName(s.name); setEditParentName(s.parentName);
    setEditGuardianPhone(s.guardianPhone || ''); setEditGuardianEmail(s.guardianEmail || '');
    setEditDateOfBirth(s.dateOfBirth || ''); setEditGender(s.gender || 'Male');
    setEditAddress(s.address); setEditClassName(s.className); setEditSection(s.section);
    setEditAnnualFee(String(s.annualFee)); setEditAmountPaid(String(s.amountPaid));
  }

  function submitEdit(event: FormEvent) {
    event.preventDefault();
    if (!editId) return;
    const annualFeeNum = Number(editAnnualFee);
    if (!Number.isFinite(annualFeeNum) || annualFeeNum <= 0) return;
    updateStudent(editId, {
      name: editName.trim(), parentName: editParentName.trim() || 'Parent details pending',
      guardianPhone: editGuardianPhone, guardianEmail: editGuardianEmail,
      dateOfBirth: editDateOfBirth, gender: editGender,
      address: editAddress.trim() || 'Address pending',
      className: editClassName, section: editSection,
      annualFee: annualFeeNum, amountPaid: Math.min(Number(editAmountPaid) || 0, annualFeeNum)
    });
    onToast?.('Student updated successfully');
  }

  function clearEdit() {
    setEditId(''); setEditName(''); setEditParentName(''); setEditGuardianPhone(''); setEditGuardianEmail('');
    setEditDateOfBirth(''); setEditGender('Male'); setEditAddress('');
    setEditClassName('Class 8'); setEditSection('A'); setEditAnnualFee('62400'); setEditAmountPaid('0');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-3 border-b border-black/10 dark:border-gray-700 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold dark:text-gray-100">Students</h2>
            <p className="text-sm text-black/55 dark:text-gray-400">Admissions, class allocation, attendance, and fee status.</p>
          </div>
          <div className="flex items-center gap-2">
            <SearchToolbar query={query} onQueryChange={setQuery} classFilter={classFilter} onClassFilterChange={setClassFilter} placeholder="Search…" />
            <CSVExportButton filename="students.csv"
              headers={['Admission No','Name','Parent','Phone','Email','DOB','Gender','Address','Class','Section','Attendance','Fee Status','Annual Fee','Amount Paid']}
              rows={filtered.map((s) => [s.admissionNo,s.name,s.parentName,s.guardianPhone,s.guardianEmail,s.dateOfBirth,s.gender,s.address,s.className,s.section,String(s.attendance),s.feeStatus,String(s.annualFee),String(s.amountPaid)])}
            />
          </div>
        </div>
        <DataTable
          headers={['Admission','Name','Parent','Class','Section','Attendance','Fees','Annual Fee','Paid']}
          rows={filtered.map((s) => [
            s.admissionNo,
            <TextAction key={`${s.id}-n`} label={s.name} onClick={() => startEdit(s.id)} />,
            s.parentName, s.className, s.section, `${s.attendance}%`,
            <StatusBadge key={`${s.id}-st`} status={s.feeStatus} />,
            rupee.format(s.annualFee), rupee.format(s.amountPaid),
            <div key={`${s.id}-act`} className="flex gap-2">
              <IconButton label={`Edit ${s.name}`} onClick={() => startEdit(s.id)} icon={Pencil} />
              <IconButton label={`Delete ${s.name}`} onClick={() => setDeleteConfirm({id:s.id,name:s.name})} icon={Trash2} />
            </div>
          ])}
          actionHeader="Actions"
        />
      </section>

      {/* Add Student */}
      <form onSubmit={submit} className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5 xl:col-start-2">
        <div className="flex items-center gap-2"><UserRoundPlus size={19} className="text-cedar" /><h3 className="font-semibold dark:text-gray-100">Add Student</h3></div>
        <div className="mt-5 space-y-4">
          <Field label="Student name" value={name} onChange={setName} placeholder="Full name" />
          <Field label="Parent / guardian" value={parentName} onChange={setParentName} placeholder="Parent name" />
          <Field label="Guardian phone" value={guardianPhone} onChange={setGuardianPhone} placeholder="+91 98765 43210" />
          <Field label="Guardian email" value={guardianEmail} onChange={setGuardianEmail} placeholder="parent@email.com" />
          <Field label="Date of birth" value={dateOfBirth} onChange={setDateOfBirth} placeholder="YYYY-MM-DD" />
          <Select label="Gender" value={gender} onChange={setGender} options={['Male','Female','Other']} />
          <Field label="Address" value={address} onChange={setAddress} placeholder="House no, locality, city" />
          <Select label="Class" value={className} onChange={updateNewStudentClass} options={editableClassOptions} />
          <Select label="Section" value={section} onChange={setSection} options={['A','B','C','Science','Commerce']} />
          <Field label="Annual fee (INR)" value={annualFee} onChange={setAnnualFee} placeholder="54000" />
          <Field label="Paid at admission (INR)" value={amountPaid} onChange={setAmountPaid} placeholder="0" />
        </div>
        <button className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cedar text-sm font-semibold text-white"><Plus size={17} /> Add student</button>
      </form>

      {/* Edit Student - ALL fields editable */}
      <form onSubmit={submitEdit} className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5 xl:col-start-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Pencil size={19} className="text-cedar" /><h3 className="font-semibold dark:text-gray-100">Edit Student</h3></div>
          {editId && <IconButton label="Cancel" onClick={clearEdit} icon={X} />}
        </div>
        {selectedStudent ? (
          <>
            <div className="mt-4 space-y-4">
              <Field label="Student name" value={editName} onChange={setEditName} placeholder="Full name" />
              <Field label="Parent / guardian" value={editParentName} onChange={setEditParentName} placeholder="Parent name" />
              <Field label="Guardian phone" value={editGuardianPhone} onChange={setEditGuardianPhone} placeholder="+91 98765 43210" />
              <Field label="Guardian email" value={editGuardianEmail} onChange={setEditGuardianEmail} placeholder="parent@email.com" />
              <Field label="Date of birth" value={editDateOfBirth} onChange={setEditDateOfBirth} placeholder="YYYY-MM-DD" />
              <Select label="Gender" value={editGender} onChange={setEditGender} options={['Male','Female','Other']} />
              <Field label="Address" value={editAddress} onChange={setEditAddress} placeholder="House no, locality, city" />
              <Select label="Class" value={editClassName} onChange={setEditClassName} options={editableClassOptions} />
              <Select label="Section" value={editSection} onChange={setEditSection} options={['A','B','C','Science','Commerce']} />
              <Field label="Annual fee (INR)" value={editAnnualFee} onChange={setEditAnnualFee} placeholder="54000" />
              <Field label="Amount paid (INR)" value={editAmountPaid} onChange={setEditAmountPaid} placeholder="0" />
            </div>
            <button className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cedar text-sm font-semibold text-white"><Check size={17} /> Save changes</button>
          </>
        ) : (
          <EmptyPanel text="Click the pencil icon on any student to edit all fields." />
        )}
      </form>

      <ConfirmDialog open={deleteConfirm !== null} title="Delete student"
        message={`Delete "${deleteConfirm?.name}"? This cannot be undone.`}
        onConfirm={() => { if (deleteConfirm) { deleteStudent(deleteConfirm.id); onToast?.('Student deleted'); setDeleteConfirm(null); } }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

// ── Teachers ──────────────────────────────────────────────
export function TeachersPage({ onToast }: { onToast?: (msg: string, type?: 'success' | 'error') => void }) {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useSchoolStore();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All classes');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [classes, setClasses] = useState('Class 8A');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [qualification, setQualification] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  // Edit - ALL fields
  const [editTeacherId, setEditTeacherId] = useState('');
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('Mathematics');
  const [editClasses, setEditClasses] = useState('Class 8A');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editQualification, setEditQualification] = useState('');
  const [editJoiningDate, setEditJoiningDate] = useState('');
  const [deleteTchConfirm, setDeleteTchConfirm] = useState<{ id: string; name: string } | null>(null);
  const selectedTeacher = teachers.find((t) => t.id === editTeacherId);

  const filtered = useMemo(() => teachers.filter((t) =>
    matchesSearch([t.name, t.employeeNo, t.subject, t.classes], query)
    && matchesClass(t.classes, classFilter)
  ), [classFilter, query, teachers]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    addTeacher({
      employeeNo: `EMP-${201 + teachers.length}`,
      name: name.trim(), subject, classes: classes.trim() || 'Class 8A',
      phone: phone.trim() || '+91 98765 00000',
      email, qualification, joiningDate
    });
    setName(''); setPhone(''); setEmail(''); setQualification(''); setJoiningDate('');
    onToast?.('Teacher added successfully');
  }

  function startTeacherEdit(teacherId: string) {
    const t = teachers.find((item) => item.id === teacherId);
    if (!t) return;
    setEditTeacherId(t.id); setEditName(t.name);
    setEditSubject(t.subject); setEditClasses(t.classes); setEditPhone(t.phone);
    setEditEmail(t.email || ''); setEditQualification(t.qualification || ''); setEditJoiningDate(t.joiningDate || '');
  }

  function submitTeacherEdit(event: FormEvent) {
    event.preventDefault();
    if (!editTeacherId) return;
    updateTeacher(editTeacherId, {
      name: editName.trim(), subject: editSubject, classes: editClasses, phone: editPhone,
      email: editEmail, qualification: editQualification, joiningDate: editJoiningDate
    });
    onToast?.('Teacher updated successfully');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-3 border-b border-black/10 dark:border-gray-700 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-xl font-semibold dark:text-gray-100">Teachers</h2><p className="text-sm text-black/55 dark:text-gray-400">Subject ownership and class assignments.</p></div>
          <div className="flex items-center gap-2">
            <SearchToolbar query={query} onQueryChange={setQuery} classFilter={classFilter} onClassFilterChange={setClassFilter} placeholder="Search…" />
            <CSVExportButton filename="teachers.csv"
              headers={['Employee No','Name','Subject','Classes','Phone','Email','Qualification','Joining Date']}
              rows={filtered.map((t) => [t.employeeNo,t.name,t.subject,t.classes,t.phone,t.email,t.qualification,t.joiningDate])}
            />
          </div>
        </div>
        <DataTable
          headers={['Employee','Name','Subject','Classes','Phone']}
          rows={filtered.map((t) => [
            t.employeeNo,
            <TextAction key={`${t.id}-n`} label={t.name} onClick={() => startTeacherEdit(t.id)} />,
            t.subject, t.classes, t.phone,
            <div key={`${t.id}-act`} className="flex gap-2">
              <IconButton label={`Edit ${t.name}`} onClick={() => startTeacherEdit(t.id)} icon={Pencil} />
              <IconButton label={`Delete ${t.name}`} onClick={() => setDeleteTchConfirm({id:t.id,name:t.name})} icon={Trash2} />
            </div>
          ])}
          actionHeader="Actions"
        />
      </section>

      <form onSubmit={submit} className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5">
        <div className="flex items-center gap-2"><UserRoundPlus size={19} className="text-cedar" /><h3 className="font-semibold dark:text-gray-100">Add Teacher</h3></div>
        <div className="mt-5 space-y-4">
          <Field label="Teacher name" value={name} onChange={setName} placeholder="Full name" />
          <Select label="Subject" value={subject} onChange={setSubject} options={['Mathematics','Physics','English','Hindi','Accountancy','History','Biology','Chemistry','Computer Science']} />
          <Field label="Classes" value={classes} onChange={setClasses} placeholder="Class 8A, Class 9B" />
          <Field label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 00000" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="teacher@school.edu" />
          <Field label="Qualification" value={qualification} onChange={setQualification} placeholder="M.Sc. Mathematics" />
          <Field label="Joining date" value={joiningDate} onChange={setJoiningDate} placeholder="YYYY-MM-DD" />
        </div>
        <button className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cedar text-sm font-semibold text-white"><Plus size={17} /> Add teacher</button>
      </form>

      <form onSubmit={submitTeacherEdit} className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5 xl:col-start-2">
        <div className="flex items-center gap-2"><Pencil size={19} className="text-cedar" /><h3 className="font-semibold dark:text-gray-100">Edit Teacher</h3></div>
        {selectedTeacher ? (
          <>
            <div className="mt-4 space-y-4">
              <Field label="Teacher name" value={editName} onChange={setEditName} placeholder="Full name" />
              <Select label="Subject" value={editSubject} onChange={setEditSubject} options={['Mathematics','Physics','English','Hindi','Accountancy','History','Biology','Chemistry','Computer Science']} />
              <Field label="Classes" value={editClasses} onChange={setEditClasses} placeholder="Class 8A, Class 9B" />
              <Field label="Phone" value={editPhone} onChange={setEditPhone} placeholder="+91 98765 00000" />
              <Field label="Email" value={editEmail} onChange={setEditEmail} placeholder="teacher@school.edu" />
              <Field label="Qualification" value={editQualification} onChange={setEditQualification} placeholder="M.Sc." />
              <Field label="Joining date" value={editJoiningDate} onChange={setEditJoiningDate} placeholder="YYYY-MM-DD" />
            </div>
            <button className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cedar text-sm font-semibold text-white"><Check size={17} /> Save teacher</button>
          </>
        ) : (<EmptyPanel text="Click the pencil icon on any teacher to edit all fields." />)}
      </form>

      <ConfirmDialog open={deleteTchConfirm !== null} title="Delete teacher"
        message={`Delete "${deleteTchConfirm?.name}"?`}
        onConfirm={() => { if (deleteTchConfirm) { deleteTeacher(deleteTchConfirm.id); onToast?.('Teacher deleted'); setDeleteTchConfirm(null); } }}
        onCancel={() => setDeleteTchConfirm(null)}
      />
    </div>
  );
}

// ── Attendance ────────────────────────────────────────────
export function AttendancePage() {
  const students = useSchoolStore((state) => state.students);
  const updateStudentAttendance = useSchoolStore((state) => state.updateStudentAttendance);
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All classes');
  const [attendanceStudentId, setAttendanceStudentId] = useState('');
  const [attendanceValue, setAttendanceValue] = useState('');
  const selectedAttendanceStudent = students.find((s) => s.id === attendanceStudentId);
  const filtered = useMemo(() => students.filter((s) =>
    matchesSearch([s.name, s.admissionNo, s.className, s.section], query)
    && matchesClass(s.className, classFilter)
  ), [classFilter, query, students]);

  function startAttendance(student: Student) { setAttendanceStudentId(student.id); setAttendanceValue(String(student.attendance)); }
  function submitAttendance(event: FormEvent) {
    event.preventDefault();
    if (!attendanceStudentId) return;
    const next = Number(attendanceValue);
    if (!Number.isFinite(next)) return;
    updateStudentAttendance(attendanceStudentId, Math.max(0, Math.min(100, Math.round(next))));
  }

  return (
    <SectionCard icon={CalendarCheck} title="Attendance" subtitle="Daily marking and class/date reports.">
      <SearchToolbar query={query} onQueryChange={setQuery} classFilter={classFilter} onClassFilterChange={setClassFilter} placeholder="Search…" />
      <form onSubmit={submitAttendance} className="grid gap-3 rounded-lg border border-black/10 p-4 dark:border-gray-700 sm:grid-cols-[1.3fr_1fr_auto] sm:items-end">
        <div className="rounded-md bg-mist dark:bg-gray-700 p-3 text-sm">
          {selectedAttendanceStudent ? (
            <><p className="font-medium dark:text-gray-200">{selectedAttendanceStudent.name}</p><p className="mt-1 text-black/55 dark:text-gray-400">{selectedAttendanceStudent.className} {selectedAttendanceStudent.section} · Current {selectedAttendanceStudent.attendance}%</p></>
          ) : (<p className="text-black/55 dark:text-gray-400">Click any student name to mark attendance.</p>)}
        </div>
        <Field label="Attendance %" value={attendanceValue} onChange={setAttendanceValue} placeholder="95" />
        <button disabled={!attendanceStudentId} className="flex h-10 items-center justify-center gap-2 rounded-md bg-cedar px-4 text-sm font-semibold text-white disabled:opacity-60"><Check size={17} /> Mark</button>
      </form>
      <DataTable
        headers={['Student','Class','Section','Today','Attendance %']}
        rows={filtered.map((s) => [
          <TextAction key={`${s.id}-an`} label={s.name} onClick={() => startAttendance(s)} />,
          s.className, s.section, s.attendance >= 90 ? 'Present' : 'Needs follow-up', `${s.attendance}%`,
          <IconButton key={`${s.id}-am`} label={`Mark ${s.name}`} onClick={() => startAttendance(s)} icon={CalendarCheck} />
        ])}
        actionHeader="Mark"
      />
    </SectionCard>
  );
}

// ── Fees ──────────────────────────────────────────────────
export function FeesPage() {
  const students = useSchoolStore((state) => state.students);
  const recordFeePayment = useSchoolStore((state) => state.recordFeePayment);
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All classes');
  const [payStudentId, setPayStudentId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const selectedPaymentStudent = students.find((s) => s.id === payStudentId);
  const filtered = useMemo(() => students.filter((s) =>
    matchesSearch([s.name, s.admissionNo, s.className, s.section, s.feeStatus], query)
    && matchesClass(s.className, classFilter)
  ), [classFilter, query, students]);

  function submitPayment(event: FormEvent) {
    event.preventDefault();
    if (!payStudentId) return;
    const amount = Number(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    recordFeePayment(payStudentId, amount);
    setPayAmount('');
  }
  function startPayment(student: Student) { setPayStudentId(student.id); setPayAmount(String(Math.max(student.annualFee - student.amountPaid, 0))); }

  return (
    <SectionCard icon={CreditCard} title="Fees" subtitle="Payment tracking, pending dues, and receipt status.">
      <SearchToolbar query={query} onQueryChange={setQuery} classFilter={classFilter} onClassFilterChange={setClassFilter} placeholder="Search…" />
      <form onSubmit={submitPayment} className="grid gap-3 rounded-lg border border-black/10 p-4 dark:border-gray-700 sm:grid-cols-[1.3fr_1fr_auto] sm:items-end">
        <div className="rounded-md bg-mist dark:bg-gray-700 p-3 text-sm">
          {selectedPaymentStudent ? (<><p className="font-medium dark:text-gray-200">{selectedPaymentStudent.name}</p><p className="mt-1 text-black/55 dark:text-gray-400">Due {rupee.format(Math.max(selectedPaymentStudent.annualFee - selectedPaymentStudent.amountPaid, 0))}</p></>
          ) : (<p className="text-black/55 dark:text-gray-400">Click the rupee button in a row to collect payment.</p>)}
        </div>
        <Field label="Amount paid (INR)" value={payAmount} onChange={setPayAmount} placeholder="10000" />
        <button disabled={!payStudentId} className="flex h-10 items-center justify-center gap-2 rounded-md bg-cedar px-4 text-sm font-semibold text-white disabled:opacity-60"><ReceiptText size={17} /> Record payment</button>
      </form>
      <DataTable
        headers={['Student','Class','Fee Status','Annual Fee','Paid','Due']}
        rows={filtered.map((s) => [
          s.feeStatus === 'Paid' ? s.name : <TextAction key={`${s.id}-fn`} label={s.name} onClick={() => startPayment(s)} />,
          s.className, <StatusBadge key={`${s.id}-fs`} status={s.feeStatus} />,
          rupee.format(s.annualFee), rupee.format(s.amountPaid), rupee.format(Math.max(s.annualFee - s.amountPaid, 0)),
          s.feeStatus === 'Paid'
            ? <span key={`${s.id}-rc`} className="text-black/55 dark:text-gray-400">Receipt ready</span>
            : <IconButton key={`${s.id}-cp`} label={`Collect ${s.name}`} onClick={() => startPayment(s)} icon={IndianRupee} />
        ])}
      />
    </SectionCard>
  );
}

// ── Exams ─────────────────────────────────────────────────
export function ExamsPage({ onToast }: { onToast?: (msg: string, type?: 'success' | 'error') => void }) {
  const { exams, addExam, updateExam, deleteExam } = useSchoolStore();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All classes');
  const [examName, setExamName] = useState('');
  const [examClassName, setExamClassName] = useState('Class 8');
  const [examStatus, setExamStatus] = useState('Scheduled');
  const [resultCards, setResultCards] = useState('Pending');
  // Edit state
  const [editExamId, setEditExamId] = useState('');
  const [editExamName, setEditExamName] = useState('');
  const [editExamClassName, setEditExamClassName] = useState('Class 8');
  const [editExamStatus, setEditExamStatus] = useState('Scheduled');
  const [editExamResultCards, setEditExamResultCards] = useState('Pending');
  const [deleteExamConfirm, setDeleteExamConfirm] = useState<{ id: string; name: string } | null>(null);
  const selectedExam = exams.find((e) => e.id === editExamId);

  const filtered = exams.filter((e) =>
    matchesSearch([e.name, e.className, e.status, e.resultCards], query)
    && matchesClass(e.className, classFilter)
  );

  function submitExam(event: FormEvent) {
    event.preventDefault();
    if (!examName.trim()) return;
    addExam({ name: examName.trim(), className: examClassName, status: examStatus, resultCards });
    setExamName(''); setResultCards('Pending');
    onToast?.('Exam created');
  }

  function startExamEdit(examId: string) {
    const e = exams.find((x) => x.id === examId);
    if (!e) return;
    setEditExamId(e.id); setEditExamName(e.name); setEditExamClassName(e.className);
    setEditExamStatus(e.status); setEditExamResultCards(e.resultCards);
  }

  function submitExamEdit(event: FormEvent) {
    event.preventDefault();
    if (!editExamId) return;
    updateExam(editExamId, { name: editExamName.trim(), className: editExamClassName, status: editExamStatus, resultCards: editExamResultCards });
    onToast?.('Exam updated');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <SectionCard icon={BookOpen} title="Exams & Results" subtitle="Exam setup, marks entry, and report card status.">
        <SearchToolbar query={query} onQueryChange={setQuery} classFilter={classFilter} onClassFilterChange={setClassFilter} placeholder="Search…" />
        <DataTable
          headers={['Exam','Class','Status','Result Cards']}
          rows={filtered.map((e) => [e.name, e.className, e.status, e.resultCards,
            <div key={`${e.id}-act`} className="flex gap-2">
              <IconButton label={`Edit ${e.name}`} onClick={() => startExamEdit(e.id)} icon={Pencil} />
              <IconButton label={`Delete ${e.name}`} onClick={() => setDeleteExamConfirm({id:e.id,name:e.name})} icon={Trash2} />
            </div>
          ])}
          actionHeader="Actions"
        />
        <ConfirmDialog open={deleteExamConfirm !== null} title="Delete exam"
          message={`Delete "${deleteExamConfirm?.name}"?`}
          onConfirm={() => { if (deleteExamConfirm) { deleteExam(deleteExamConfirm.id); onToast?.('Exam deleted'); setDeleteExamConfirm(null); } }}
          onCancel={() => setDeleteExamConfirm(null)}
        />
      </SectionCard>

      <div className="space-y-6 xl:col-start-2">
        <form onSubmit={submitExam} className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5">
          <div className="flex items-center gap-2"><Plus size={19} className="text-cedar" /><h3 className="font-semibold dark:text-gray-100">Add Exam</h3></div>
          <div className="mt-5 space-y-4">
            <Field label="Exam name" value={examName} onChange={setExamName} placeholder="Annual Exam" />
            <Select label="Class" value={examClassName} onChange={setExamClassName} options={editableClassOptions} />
            <Select label="Status" value={examStatus} onChange={setExamStatus} options={['Draft','Scheduled','Marks entry open','Published']} />
            <Field label="Result cards" value={resultCards} onChange={setResultCards} placeholder="Pending" />
          </div>
          <button className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cedar text-sm font-semibold text-white"><Plus size={17} /> Create exam</button>
        </form>

        {selectedExam && (
          <form onSubmit={submitExamEdit} className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5">
            <div className="flex items-center gap-2"><Pencil size={19} className="text-cedar" /><h3 className="font-semibold dark:text-gray-100">Edit Exam</h3></div>
            <div className="mt-5 space-y-4">
              <Field label="Exam name" value={editExamName} onChange={setEditExamName} placeholder="Annual Exam" />
              <Select label="Class" value={editExamClassName} onChange={setEditExamClassName} options={editableClassOptions} />
              <Select label="Status" value={editExamStatus} onChange={setEditExamStatus} options={['Draft','Scheduled','Marks entry open','Published']} />
              <Field label="Result cards" value={editExamResultCards} onChange={setEditExamResultCards} placeholder="Pending" />
            </div>
            <button className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cedar text-sm font-semibold text-white"><Check size={17} /> Save exam</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────
export function NotificationsPage({ onToast }: { onToast?: (msg: string, type?: 'success' | 'error') => void }) {
  const { notifications, addNotification, updateNotification, deleteNotification } = useSchoolStore();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All classes');
  const [title, setTitle] = useState('');
  const [notificationClassName, setNotificationClassName] = useState('Class 8');
  const [person, setPerson] = useState('');
  const [status, setStatus] = useState('Queued for SMS and email');
  const [editNoteId, setEditNoteId] = useState('');
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [editNoteClassName, setEditNoteClassName] = useState('Class 8');
  const [editNotePerson, setEditNotePerson] = useState('');
  const [editNoteStatus, setEditNoteStatus] = useState('Queued for SMS and email');
  const [deleteNoteConfirm, setDeleteNoteConfirm] = useState<{ id: string; title: string } | null>(null);
  const selectedNote = notifications.find((n) => n.id === editNoteId);

  const filtered = notifications.filter((n) =>
    matchesSearch([n.title, n.className, n.person, n.status], query)
    && matchesClass(n.className, classFilter)
  );

  function submitNotification(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !person.trim()) return;
    addNotification({ title: title.trim(), className: notificationClassName, person: person.trim(), status });
    setTitle(''); setPerson('');
    onToast?.('Notification sent');
  }

  function startNoteEdit(noteId: string) {
    const n = notifications.find((x) => x.id === noteId);
    if (!n) return;
    setEditNoteId(n.id); setEditNoteTitle(n.title); setEditNoteClassName(n.className);
    setEditNotePerson(n.person); setEditNoteStatus(n.status);
  }

  function submitNoteEdit(event: FormEvent) {
    event.preventDefault();
    if (!editNoteId) return;
    updateNotification(editNoteId, { title: editNoteTitle.trim(), className: editNoteClassName, person: editNotePerson.trim(), status: editNoteStatus });
    onToast?.('Notification updated');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <SectionCard icon={Bell} title="Notifications" subtitle="Email, mock SMS, and in-app communication queue.">
        <SearchToolbar query={query} onQueryChange={setQuery} classFilter={classFilter} onClassFilterChange={setClassFilter} placeholder="Search…" />
        <div className="grid gap-4 lg:grid-cols-3">
          {filtered.map((item) => (
            <article key={item.id} className="group relative rounded-lg border border-black/10 p-4 dark:border-gray-700">
              <button type="button" onClick={() => setDeleteNoteConfirm({ id: item.id, title: item.title })}
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-black/30 opacity-0 hover:bg-mist dark:hover:bg-gray-700 hover:text-rosewood group-hover:opacity-100" title="Delete">
                <X size={16} />
              </button>
              <button type="button" onClick={() => startNoteEdit(item.id)} className="font-medium text-left w-full dark:text-gray-200">{item.title}</button>
              <p className="mt-3 text-sm text-black/55 dark:text-gray-400">{item.person} · {item.className}</p>
              <p className="mt-1 text-sm text-black/55 dark:text-gray-400">{item.status}</p>
            </article>
          ))}
        </div>
        <ConfirmDialog open={deleteNoteConfirm !== null} title="Delete notification"
          message={`Delete "${deleteNoteConfirm?.title}"?`}
          onConfirm={() => { if (deleteNoteConfirm) { deleteNotification(deleteNoteConfirm.id); onToast?.('Notification deleted'); setDeleteNoteConfirm(null); } }}
          onCancel={() => setDeleteNoteConfirm(null)}
        />
      </SectionCard>

      <div className="space-y-6 xl:col-start-2">
        <form onSubmit={submitNotification} className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5">
          <div className="flex items-center gap-2"><Send size={19} className="text-cedar" /><h3 className="font-semibold dark:text-gray-100">Send Notification</h3></div>
          <div className="mt-5 space-y-4">
            <Field label="Message title" value={title} onChange={setTitle} placeholder="Fee reminder" />
            <Select label="Class" value={notificationClassName} onChange={setNotificationClassName} options={editableClassOptions} />
            <Field label="Person or group" value={person} onChange={setPerson} placeholder="Class 8B guardians" />
            <Select label="Channel" value={status} onChange={setStatus} options={['Queued for SMS and email','Queued for SMS','In-app notification active','Sent today']} />
          </div>
          <button className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cedar text-sm font-semibold text-white"><Send size={17} /> Send</button>
        </form>

        {selectedNote && (
          <form onSubmit={submitNoteEdit} className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5">
            <div className="flex items-center gap-2"><Pencil size={19} className="text-cedar" /><h3 className="font-semibold dark:text-gray-100">Edit Notification</h3></div>
            <div className="mt-5 space-y-4">
              <Field label="Message title" value={editNoteTitle} onChange={setEditNoteTitle} placeholder="Fee reminder" />
              <Select label="Class" value={editNoteClassName} onChange={setEditNoteClassName} options={editableClassOptions} />
              <Field label="Person or group" value={editNotePerson} onChange={setEditNotePerson} placeholder="Class 8B guardians" />
              <Select label="Channel" value={editNoteStatus} onChange={setEditNoteStatus} options={['Queued for SMS and email','Queued for SMS','In-app notification active','Sent today']} />
            </div>
            <button className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cedar text-sm font-semibold text-white"><Check size={17} /> Save</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Student Items ─────────────────────────────────────────
export function StudentItemsPage({ onToast }: { onToast?: (msg: string, type?: 'success' | 'error') => void }) {
  const { students, studentItems, addStudentItem, updateStudentItem, deleteStudentItem } = useSchoolStore();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All classes');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [studentId, setStudentId] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('Book');
  const [quantity, setQuantity] = useState('1');
  const [providedDate, setProvidedDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<StudentItem['status']>('Issued');
  const [editItemId, setEditItemId] = useState('');
  const [editItemName, setEditItemName] = useState('');
  const [editItemType, setEditItemType] = useState('Book');
  const [editQuantity, setEditQuantity] = useState('1');
  const [editProvidedDate, setEditProvidedDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<StudentItem['status']>('Issued');
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<{ id: string; label: string } | null>(null);
  const selectedItem = studentItems.find((item) => item.id === editItemId);

  const filtered = useMemo(() => studentItems.filter((item) =>
    matchesSearch([item.studentName, item.studentAdmissionNo, item.className, item.itemName, item.itemType, item.notes, item.status], query)
    && matchesClass(item.className, classFilter)
    && (typeFilter === 'All types' || item.itemType === typeFilter)
  ), [classFilter, query, studentItems, typeFilter]);

  function submitItem(event: FormEvent) {
    event.preventDefault();
    const resolvedStudentId = studentId || students[0]?.id || '';
    const qty = Number(quantity);
    if (!resolvedStudentId || !itemName.trim() || !Number.isFinite(qty) || qty < 1) return;
    addStudentItem({
      studentId: resolvedStudentId,
      itemName: itemName.trim(),
      itemType,
      quantity: qty,
      providedDate,
      notes: notes.trim(),
      status
    });
    setItemName(''); setQuantity('1'); setNotes('');
    onToast?.('Item recorded for student');
  }

  function startItemEdit(itemId: string) {
    const item = studentItems.find((x) => x.id === itemId);
    if (!item) return;
    setEditItemId(item.id);
    setEditItemName(item.itemName);
    setEditItemType(item.itemType);
    setEditQuantity(String(item.quantity));
    setEditProvidedDate(item.providedDate);
    setEditNotes(item.notes);
    setEditStatus(item.status);
  }

  function submitItemEdit(event: FormEvent) {
    event.preventDefault();
    const qty = Number(editQuantity);
    if (!editItemId || !editItemName.trim() || !Number.isFinite(qty) || qty < 1) return;
    updateStudentItem(editItemId, {
      itemName: editItemName.trim(),
      itemType: editItemType,
      quantity: qty,
      providedDate: editProvidedDate,
      notes: editNotes.trim(),
      status: editStatus
    });
    onToast?.('Item updated');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <SectionCard icon={Package} title="Items Provided to Students" subtitle="Track books, uniforms, dresses, and other supplies issued from the school.">
        <div className="flex flex-wrap items-center gap-2">
          <SearchToolbar query={query} onQueryChange={setQuery} classFilter={classFilter} onClassFilterChange={setClassFilter} placeholder="Search items…" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-cedar dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option>All types</option>
            {itemTypeOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
          <CSVExportButton
            filename="student-items.csv"
            headers={['Student', 'Admission No', 'Class', 'Item', 'Type', 'Qty', 'Date', 'Status', 'Notes']}
            rows={filtered.map((item) => [item.studentName, item.studentAdmissionNo, item.className, item.itemName, item.itemType, String(item.quantity), item.providedDate, item.status, item.notes])}
          />
        </div>
        {filtered.length === 0 ? (
          <EmptyPanel text="No items recorded yet. Use the form to add books, dresses, or other supplies provided to a student." />
        ) : (
          <DataTable
            headers={['Student', 'Item', 'Type', 'Qty', 'Date', 'Status']}
            actionHeader="Actions"
            rows={filtered.map((item) => [
              <div key={`${item.id}-student`}>
                <p className="font-medium dark:text-gray-200">{item.studentName}</p>
                <p className="text-xs text-black/55 dark:text-gray-400">{item.studentAdmissionNo} · {item.className}</p>
              </div>,
              <div key={`${item.id}-item`}>
                <p>{item.itemName}</p>
                {item.notes && <p className="text-xs text-black/55 dark:text-gray-400">{item.notes}</p>}
              </div>,
              item.itemType,
              String(item.quantity),
              item.providedDate,
              <ItemStatusBadge key={`${item.id}-status`} status={item.status} />,
              <div key={`${item.id}-actions`} className="flex gap-2">
                <IconButton label="Edit item" onClick={() => startItemEdit(item.id)} icon={Pencil} />
                <button type="button" onClick={() => setDeleteItemConfirm({ id: item.id, label: item.itemName })} title="Delete item" className="grid h-9 w-9 place-items-center rounded-md border border-black/10 text-rosewood hover:bg-mist dark:hover:bg-gray-700">
                  <Trash2 size={17} />
                </button>
              </div>
            ])}
          />
        )}
        <ConfirmDialog open={deleteItemConfirm !== null} title="Delete item"
          message={`Remove "${deleteItemConfirm?.label}" from records?`}
          onConfirm={() => { if (deleteItemConfirm) { deleteStudentItem(deleteItemConfirm.id); onToast?.('Item deleted'); setDeleteItemConfirm(null); } }}
          onCancel={() => setDeleteItemConfirm(null)}
        />
      </SectionCard>

      <div className="space-y-6 xl:col-start-2">
        <form onSubmit={submitItem} className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5">
          <div className="flex items-center gap-2"><Plus size={19} className="text-cedar" /><h3 className="font-semibold dark:text-gray-100">Provide Item to Student</h3></div>
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-medium dark:text-gray-300">
              Student
              <select
                value={studentId || students[0]?.id || ''}
                onChange={(e) => setStudentId(e.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-black/15 bg-white px-3 outline-none focus:border-cedar dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                {students.length === 0 ? <option value="">No students available</option> : students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.admissionNo}) — {s.className}</option>
                ))}
              </select>
            </label>
            <Field label="Item name" value={itemName} onChange={setItemName} placeholder="Mathematics Textbook" />
            <Select label="Item type" value={itemType} onChange={setItemType} options={itemTypeOptions} />
            <Field label="Quantity" value={quantity} onChange={setQuantity} placeholder="1" />
            <Field label="Date provided" value={providedDate} onChange={setProvidedDate} placeholder="2025-04-01" />
            <Field label="Notes (optional)" value={notes} onChange={setNotes} placeholder="Size, edition, etc." />
            <Select label="Status" value={status} onChange={(v) => setStatus(v as StudentItem['status'])} options={[...itemStatusOptions]} />
          </div>
          <button className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cedar text-sm font-semibold text-white"><Plus size={17} /> Add Item</button>
        </form>

        {selectedItem && (
          <form onSubmit={submitItemEdit} className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5">
            <div className="flex items-center gap-2"><Pencil size={19} className="text-cedar" /><h3 className="font-semibold dark:text-gray-100">Edit Item</h3></div>
            <p className="mt-2 text-sm text-black/55 dark:text-gray-400">{selectedItem.studentName} · {selectedItem.className}</p>
            <div className="mt-5 space-y-4">
              <Field label="Item name" value={editItemName} onChange={setEditItemName} placeholder="Mathematics Textbook" />
              <Select label="Item type" value={editItemType} onChange={setEditItemType} options={itemTypeOptions} />
              <Field label="Quantity" value={editQuantity} onChange={setEditQuantity} placeholder="1" />
              <Field label="Date provided" value={editProvidedDate} onChange={setEditProvidedDate} placeholder="2025-04-01" />
              <Field label="Notes" value={editNotes} onChange={setEditNotes} placeholder="Size, edition, etc." />
              <Select label="Status" value={editStatus} onChange={(v) => setEditStatus(v as StudentItem['status'])} options={[...itemStatusOptions]} />
            </div>
            <button className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cedar text-sm font-semibold text-white"><Check size={17} /> Save</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Documents ─────────────────────────────────────────────
export function DocumentsPage({ onToast }: { onToast?: (msg: string, type?: 'success' | 'error') => void }) {
  const { students, teachers, documents, uploadDocument, downloadDocument, deleteDocument } = useSchoolStore();
  const [query, setQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('All owners');
  const [ownerType, setOwnerType] = useState('Student');
  const [ownerName, setOwnerName] = useState(students[0]?.name ?? '');
  const [ownerIdentifier, setOwnerIdentifier] = useState(students[0]?.admissionNo ?? '');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState('Admission Form');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; label: string } | null>(null);

  const filtered = useMemo(() => documents.filter((document) =>
    matchesSearch([document.ownerType, document.ownerName, document.ownerIdentifier, document.documentTitle, document.documentType, document.fileName, document.notes], query)
    && (ownerFilter === 'All owners' || document.ownerType === ownerFilter)
  ), [documents, ownerFilter, query]);

  function updateOwnerType(nextOwnerType: string) {
    setOwnerType(nextOwnerType);
    if (nextOwnerType === 'Student' && students[0]) {
      setOwnerName(students[0].name);
      setOwnerIdentifier(students[0].admissionNo);
    } else if (nextOwnerType === 'Teacher' && teachers[0]) {
      setOwnerName(teachers[0].name);
      setOwnerIdentifier(teachers[0].employeeNo);
    } else {
      setOwnerName('');
      setOwnerIdentifier('');
    }
  }

  function selectKnownOwner(value: string) {
    const [name, identifier] = value.split('||');
    setOwnerName(name);
    setOwnerIdentifier(identifier);
  }

  async function submitDocument(event: FormEvent) {
    event.preventDefault();
    if (!ownerName.trim() || !ownerIdentifier.trim() || !documentTitle.trim() || !file) {
      onToast?.('Please fill owner, title, and choose a file', 'error');
      return;
    }
    setIsUploading(true);
    try {
      await uploadDocument({
        ownerType,
        ownerName: ownerName.trim(),
        ownerIdentifier: ownerIdentifier.trim(),
        documentTitle: documentTitle.trim(),
        documentType,
        notes: notes.trim(),
        file
      });
      setDocumentTitle('');
      setNotes('');
      setFile(null);
      const input = window.document.getElementById('document-file-input') as HTMLInputElement | null;
      if (input) input.value = '';
      onToast?.('Document uploaded successfully');
    } catch {
      onToast?.('Document upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload(document: DocumentRecord) {
    try {
      await downloadDocument(document);
      onToast?.('Document download started');
    } catch {
      onToast?.('Document download failed', 'error');
    }
  }

  const knownOwners = ownerType === 'Student'
    ? students.map((student) => ({ label: `${student.name} (${student.admissionNo})`, value: `${student.name}||${student.admissionNo}` }))
    : ownerType === 'Teacher'
      ? teachers.map((teacher) => ({ label: `${teacher.name} (${teacher.employeeNo})`, value: `${teacher.name}||${teacher.employeeNo}` }))
      : [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <SectionCard icon={FileText} title="Documents" subtitle="Upload and manage documents for students, teachers, staff, parents, or other people.">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-10 items-center gap-2 rounded-md border border-black/10 px-3 text-sm dark:border-gray-600">
            <Search size={16} className="text-black/45 dark:text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents or names" className="w-56 outline-none dark:bg-transparent dark:text-gray-100" />
          </label>
          <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-cedar dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
            <option>All owners</option>
            {ownerTypeOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          <CSVExportButton
            filename="documents.csv"
            headers={['Owner Type', 'Owner Name', 'Identifier', 'Title', 'Type', 'File', 'Size', 'Uploaded At', 'Notes']}
            rows={filtered.map((document) => [document.ownerType, document.ownerName, document.ownerIdentifier, document.documentTitle, document.documentType, document.fileName, formatBytes(document.sizeBytes), formatDateTime(document.uploadedAt), document.notes])}
          />
        </div>
        {filtered.length === 0 ? (
          <EmptyPanel text="No documents uploaded yet. Use the upload panel to attach admission forms, certificates, photos, or staff documents." />
        ) : (
          <DataTable
            headers={['Owner', 'Document', 'File', 'Uploaded']}
            actionHeader="Actions"
            rows={filtered.map((document) => [
              <div key={`${document.id}-owner`}>
                <p className="font-medium dark:text-gray-200">{document.ownerName}</p>
                <p className="text-xs text-black/55 dark:text-gray-400">{document.ownerType} · {document.ownerIdentifier}</p>
              </div>,
              <div key={`${document.id}-document`}>
                <p>{document.documentTitle}</p>
                <p className="text-xs text-black/55 dark:text-gray-400">{document.documentType}{document.notes ? ` · ${document.notes}` : ''}</p>
              </div>,
              <div key={`${document.id}-file`}>
                <p>{document.fileName}</p>
                <p className="text-xs text-black/55 dark:text-gray-400">{formatBytes(document.sizeBytes)}</p>
              </div>,
              formatDateTime(document.uploadedAt),
              <div key={`${document.id}-actions`} className="flex gap-2">
                <IconButton label={`Download ${document.fileName}`} onClick={() => void handleDownload(document)} icon={Download} />
                <button type="button" onClick={() => setDeleteConfirm({ id: document.id, label: document.documentTitle })} title="Delete document" className="grid h-9 w-9 place-items-center rounded-md border border-black/10 text-rosewood hover:bg-mist dark:hover:bg-gray-700">
                  <Trash2 size={17} />
                </button>
              </div>
            ])}
          />
        )}
        <ConfirmDialog open={deleteConfirm !== null} title="Delete document"
          message={`Remove "${deleteConfirm?.label}" from document records?`}
          onConfirm={() => { if (deleteConfirm) { deleteDocument(deleteConfirm.id); onToast?.('Document deleted'); setDeleteConfirm(null); } }}
          onCancel={() => setDeleteConfirm(null)}
        />
      </SectionCard>

      <form onSubmit={(event) => void submitDocument(event)} className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-5 xl:col-start-2">
        <div className="flex items-center gap-2">
          <FileText size={19} className="text-cedar" />
          <h3 className="font-semibold dark:text-gray-100">Upload Document</h3>
        </div>
        <div className="mt-5 space-y-4">
          <Select label="Document belongs to" value={ownerType} onChange={updateOwnerType} options={ownerTypeOptions} />
          {knownOwners.length > 0 && (
            <label className="block text-sm font-medium dark:text-gray-300">
              Select person
              <select value={`${ownerName}||${ownerIdentifier}`} onChange={(e) => selectKnownOwner(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-black/15 bg-white px-3 outline-none focus:border-cedar dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                {knownOwners.map((owner) => <option key={owner.value} value={owner.value}>{owner.label}</option>)}
              </select>
            </label>
          )}
          <Field label="Person / entity name" value={ownerName} onChange={setOwnerName} placeholder="Full name" />
          <Field label="Identifier" value={ownerIdentifier} onChange={setOwnerIdentifier} placeholder="Admission no, employee no, phone, etc." />
          <Field label="Document title" value={documentTitle} onChange={setDocumentTitle} placeholder="Aadhaar card, birth certificate..." />
          <Select label="Document type" value={documentType} onChange={setDocumentType} options={documentTypeOptions} />
          <Field label="Notes" value={notes} onChange={setNotes} placeholder="Optional details" />
          <label className="block text-sm font-medium dark:text-gray-300">
            File
            <input
              id="document-file-input"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-2 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-cedar dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
            {file && <span className="mt-2 block text-xs text-black/55 dark:text-gray-400">{file.name} · {formatBytes(file.size)}</span>}
          </label>
        </div>
        <button disabled={isUploading} className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-cedar text-sm font-semibold text-white disabled:opacity-60">
          <Plus size={17} />
          {isUploading ? 'Uploading...' : 'Upload document'}
        </button>
      </form>
    </div>
  );
}

// ── Shared Components ─────────────────────────────────────
function SectionCard({ icon: Icon, title, subtitle, children }: { icon: typeof Bell; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-3 border-b border-black/10 dark:border-gray-700 p-5">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-mist dark:bg-gray-700 text-cedar"><Icon size={20} /></div>
        <div><h2 className="text-xl font-semibold dark:text-gray-100">{title}</h2><p className="text-sm text-black/55 dark:text-gray-400">{subtitle}</p></div>
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

function SearchToolbar({ query, onQueryChange, classFilter, onClassFilterChange, placeholder }: {
  query: string; onQueryChange: (v: string) => void; classFilter: string; onClassFilterChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="flex h-10 items-center gap-2 rounded-md border border-black/10 px-3 text-sm dark:border-gray-600">
        <Search size={16} className="text-black/45 dark:text-gray-400" />
        <input value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder={placeholder} className="w-44 outline-none dark:bg-transparent dark:text-gray-100" />
      </label>
      <select value={classFilter} onChange={(e) => onClassFilterChange(e.target.value)} className="h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-cedar dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
        {classOptions.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function DataTable({ headers, rows, actionHeader }: { headers: string[]; rows: ReactNode[][]; actionHeader?: string }) {
  const visibleHeaders = actionHeader ? [...headers, actionHeader] : headers;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-mist dark:bg-gray-700 text-xs uppercase tracking-wide text-black/55 dark:text-gray-400">
          <tr>{visibleHeaders.map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-black/10 dark:divide-gray-700">
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-[#f9fbfa] dark:hover:bg-gray-700/50">
              {row.map((cell, ci) => <td key={`${ri}-${ci}`} className="px-5 py-4">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: Student['feeStatus'] }) {
  const styles = { Paid: 'border-emerald-200 bg-emerald-50 text-emerald-700', Pending: 'border-amber-200 bg-amber-50 text-amber-700', Overdue: 'border-rose-200 bg-rose-50 text-rose-700' };
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>;
}

function ItemStatusBadge({ status }: { status: StudentItem['status'] }) {
  const styles = { Issued: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', Returned: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300' };
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>;
}

function IconButton({ label, onClick, icon: Icon }: { label: string; onClick: () => void; icon: typeof Pencil }) {
  return <button type="button" onClick={onClick} title={label} aria-label={label} className="grid h-9 w-9 place-items-center rounded-md border border-black/10 text-cedar hover:bg-mist dark:hover:bg-gray-700"><Icon size={17} /></button>;
}

function TextAction({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="font-semibold text-cedar underline-offset-4 hover:underline">{label}</button>;
}

function EmptyPanel({ text }: { text: string }) {
  return <div className="mt-5 rounded-md border border-dashed border-black/20 dark:border-gray-600 p-4 text-sm text-black/55 dark:text-gray-400">{text}</div>;
}

function matchesSearch(values: string[], query: string) {
  const nq = query.trim().toLowerCase();
  if (!nq) return true;
  return values.join(' ').toLowerCase().includes(nq);
}

function matchesClass(value: string, filter: string) {
  return filter === 'All classes' || value.toLowerCase().includes(filter.toLowerCase());
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="block text-sm font-medium dark:text-gray-300">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 h-10 w-full rounded-md border border-black/15 px-3 outline-none focus:border-cedar dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block text-sm font-medium dark:text-gray-300">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-black/15 bg-white px-3 outline-none focus:border-cedar dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70" onClick={onCancel}>
      <div className="mx-4 w-full max-w-sm rounded-lg border border-black/10 bg-white dark:border-gray-700 dark:bg-gray-800 p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold dark:text-gray-100">{title}</h3>
        <p className="mt-2 text-sm text-black/65 dark:text-gray-400">{message}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="h-10 rounded-md border border-black/10 px-4 text-sm font-medium dark:border-gray-600 dark:text-gray-300">Cancel</button>
          <button onClick={onConfirm} className="h-10 rounded-md bg-rosewood px-4 text-sm font-semibold text-white">Delete</button>
        </div>
      </div>
    </div>
  );
}

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function CSVExportButton({ filename, headers, rows }: { filename: string; headers: string[]; rows: string[][] }) {
  return (
    <button type="button" onClick={() => downloadCSV(filename, headers, rows)} title="Export CSV" className="flex h-9 items-center gap-2 rounded-md border border-black/10 px-3 text-sm text-black/70 hover:bg-mist dark:hover:bg-gray-700">
      <Download size={15} /> CSV
    </button>
  );
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDateTime(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
