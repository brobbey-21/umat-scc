/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Church, ShieldCheck, UserPlus, Home } from 'lucide-react';
import { StudentRegistration, DenominationAdmin, Denomination, OutreachStatus } from './types';
import {
  fetchStudentCount, fetchStudents, createStudent, updateStudentStatus,
  fetchAdmins, createAdmin, deleteAdmin,
  fetchDenominations, createDenomination, updateDenomination, deleteDenomination,
  fetchHostels, createHostel, deleteHostel,
  fetchCourses, createCourse, deleteCourse,
  login, logout, isAuthenticated,
  Hostel, Course
} from './api/client';
import { Sidebar, MainNavTab, AdminView } from './components/Sidebar';
import { LandingHero } from './components/LandingHero';
import { StudentRegistrationForm } from './components/StudentRegistrationForm';
import { AdminPortal } from './components/AdminPortal';
import { AdminLogin } from './components/AdminLogin';
import { Dashboard } from './components/Dashboard';
import { DenominationManagement } from './components/DenominationManagement';
import { ReferenceDataManager } from './components/ReferenceDataManager';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainNavTab>('landing');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAuthenticated());
  const [students, setStudents] = useState<StudentRegistration[]>([]);
  const [admins, setAdmins] = useState<DenominationAdmin[]>([]);
  const [denominations, setDenominations] = useState<Denomination[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [registrationDenomId, setRegistrationDenomId] = useState<string | null>(null);

  const handleSelectFellowship = useCallback((denominationId: string) => {
    setRegistrationDenomId(denominationId);
    setCurrentTab('register');
  }, []);

  // Initial load
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [count, denoms, hostelList, courseList] = await Promise.all([
          fetchStudentCount(),
          fetchDenominations(),
          fetchHostels(),
          fetchCourses()
        ]);
        if (!cancelled) {
          setStudentCount(count);
          setDenominations(denoms);
          setHostels(hostelList);
          setCourses(courseList);
        }
      } catch (e) {
        console.error('Failed to fetch initial data:', e);
      }

      if (isAuthenticated()) {
        try {
          const [studentsData, adminsData] = await Promise.all([
            fetchStudents(),
            fetchAdmins()
          ]);
          if (!cancelled) {
            setStudents(studentsData);
            setAdmins(adminsData);
          }
        } catch {
          logout();
          if (!cancelled) setIsAdmin(false);
        }
      }

      if (!cancelled) setIsLoading(false);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const handleLogin = useCallback(async (password: string) => {
    await login(password);
    setIsAdmin(true);
    setAdminView('dashboard');
    const [studentsData, adminsData] = await Promise.all([fetchStudents(), fetchAdmins()]);
    setStudents(studentsData);
    setAdmins(adminsData);
    setStudentCount(studentsData.length);
    showToast('Welcome back, SCC Administrator!');
  }, [showToast]);

  const handleLogout = useCallback(() => {
    logout();
    setIsAdmin(false);
    setStudents([]);
    setAdmins([]);
    setCurrentTab('landing');
    showToast('Logged out successfully.');
  }, [showToast]);

  // ── Students ──────────────────────────────────────────────────────────────

  const handleRegisterSuccess = useCallback(async (newStudent: StudentRegistration) => {
    try {
      const saved = await createStudent(newStudent);
      setStudents((prev) => [saved, ...prev]);
      setStudentCount((prev) => prev + 1);
      showToast(`New student ${saved.fullName} registered under ${saved.fellowshipCode}!`);
    } catch (e) {
      console.error('Registration failed:', e);
      showToast('Registration failed. Please try again.');
    }
  }, [showToast]);

  const handleUpdateStudentStatus = useCallback(async (studentId: string, status: OutreachStatus, note?: string) => {
    try {
      const updated = await updateStudentStatus(studentId, status, note);
      setStudents((prev) => prev.map((s) => (s.id === studentId ? updated : s)));
      showToast(`Outreach status updated to "${status}"`);
    } catch (e) {
      console.error('Status update failed:', e);
      showToast('Failed to update status.');
    }
  }, [showToast]);

  // ── Admins ────────────────────────────────────────────────────────────────

  const handleAddAdmin = useCallback(async (newAdmin: DenominationAdmin) => {
    try {
      const saved = await createAdmin(newAdmin);
      setAdmins((prev) => [saved, ...prev]);
      showToast(`Added ${saved.adminName} as admin for ${saved.fellowshipCode}`);
    } catch (e) {
      console.error('Add admin failed:', e);
      showToast('Failed to add admin.');
    }
  }, [showToast]);

  const handleDeleteAdmin = useCallback(async (adminId: string) => {
    try {
      await deleteAdmin(adminId);
      setAdmins((prev) => prev.filter((a) => a.id !== adminId));
      showToast('Admin representative removed.');
    } catch (e) {
      console.error('Delete admin failed:', e);
      showToast('Failed to delete admin.');
    }
  }, [showToast]);

  // ── Denominations ─────────────────────────────────────────────────────────

  const handleCreateDenomination = useCallback(async (denom: Partial<Denomination>) => {
    try {
      const saved = await createDenomination(denom);
      setDenominations((prev) => [...prev, saved]);
      showToast(`Created ${saved.shortCode} fellowship.`);
    } catch (e: any) {
      showToast(e.message || 'Failed to create denomination.');
    }
  }, [showToast]);

  const handleUpdateDenomination = useCallback(async (denomId: string, updates: Partial<Denomination>) => {
    try {
      const updated = await updateDenomination(denomId, updates);
      setDenominations((prev) => prev.map((d) => (d.id === denomId ? updated : d)));
      showToast(`Updated ${updated.shortCode} fellowship.`);
    } catch (e: any) {
      showToast(e.message || 'Failed to update denomination.');
    }
  }, [showToast]);

  const handleDeleteDenomination = useCallback(async (denomId: string) => {
    try {
      await deleteDenomination(denomId);
      setDenominations((prev) => prev.filter((d) => d.id !== denomId));
      showToast('Fellowship removed.');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete denomination.');
    }
  }, [showToast]);

  // ── Hostels ───────────────────────────────────────────────────────────────

  const handleAddHostel = useCallback(async (name: string) => {
    try {
      const saved = await createHostel(name);
      setHostels((prev) => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
      showToast(`Added hostel "${name}"`);
    } catch (e: any) {
      showToast(e.message || 'Failed to add hostel.');
    }
  }, [showToast]);

  const handleDeleteHostel = useCallback(async (id: number) => {
    try {
      await deleteHostel(id);
      setHostels((prev) => prev.filter((h) => h.id !== id));
      showToast('Hostel removed.');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete hostel.');
    }
  }, [showToast]);

  // ── Courses ───────────────────────────────────────────────────────────────

  const handleAddCourse = useCallback(async (name: string) => {
    try {
      const saved = await createCourse(name);
      setCourses((prev) => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
      showToast(`Added course "${name}"`);
    } catch (e: any) {
      showToast(e.message || 'Failed to add course.');
    }
  }, [showToast]);

  const handleDeleteCourse = useCallback(async (id: number) => {
    try {
      await deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      showToast('Course removed.');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete course.');
    }
  }, [showToast]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const studentCountsByDenom = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      counts[s.denominationId] = (counts[s.denominationId] || 0) + 1;
    });
    return counts;
  }, [students]);

  // ── Render admin content ──────────────────────────────────────────────────

  const renderAdminContent = () => {
    if (isLoading) {
      return (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#1B3B2B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#5C6861]">Loading registry data...</p>
        </div>
      );
    }

    switch (adminView) {
      case 'dashboard':
        return (
          <Dashboard
            students={students}
            admins={admins}
            denominations={denominations}
            onNavigate={(v) => setAdminView(v)}
          />
        );
      case 'students':
        return (
          <AdminPortal
            students={students}
            admins={admins}
            denominations={denominations}
            onUpdateStudentStatus={handleUpdateStudentStatus}
            onAddAdmin={handleAddAdmin}
            onDeleteAdmin={handleDeleteAdmin}
          />
        );
      case 'admins':
        return (
          <AdminPortal
            students={students}
            admins={admins}
            denominations={denominations}
            onUpdateStudentStatus={handleUpdateStudentStatus}
            onAddAdmin={handleAddAdmin}
            onDeleteAdmin={handleDeleteAdmin}
            initialTab="admins"
          />
        );
      case 'denominations':
        return (
          <DenominationManagement
            denominations={denominations}
            studentCounts={studentCountsByDenom}
            onCreate={handleCreateDenomination}
            onUpdate={handleUpdateDenomination}
            onDelete={handleDeleteDenomination}
          />
        );
      case 'reference':
        return (
          <ReferenceDataManager
            hostels={hostels}
            courses={courses}
            onAddHostel={handleAddHostel}
            onDeleteHostel={handleDeleteHostel}
            onAddCourse={handleAddCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        );
      default:
        return null;
    }
  };

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#18221D] font-sans selection:bg-[#BEE5CE] selection:text-[#1B3B2B]">
      
      {/* Admin portal layout: sidebar + content */}
      {currentTab === 'admin' && isAdmin ? (
        <div className="flex min-h-screen">
          <Sidebar
            currentTab={currentTab}
            adminView={adminView}
            onChangeTab={setCurrentTab}
            onChangeAdminView={setAdminView}
            totalStudentsCount={studentCount}
            isAdmin={isAdmin}
            onLogout={handleLogout}
          />
          <div className="flex-1 flex flex-col min-w-0">
            {notification && (
              <div className="fixed top-4 right-4 z-50 bg-[#1B3B2B] text-white px-4 py-2.5 rounded-xl shadow-sanctuary-md text-xs font-semibold flex items-center gap-2 animate-fade-in border border-[#C59B4B]">
                <span>{notification}</span>
              </div>
            )}
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {renderAdminContent()}
            </main>
          </div>
        </div>
      ) : (
        /* Public layout: top header + content */
        <div className="flex flex-col min-h-screen">
          {notification && (
            <div className="fixed top-20 right-4 z-50 bg-[#1B3B2B] text-white px-4 py-2.5 rounded-xl shadow-sanctuary-md text-xs font-semibold flex items-center gap-2 animate-fade-in border border-[#C59B4B]">
              <span>{notification}</span>
            </div>
          )}

          {/* Top Header (hidden on landing — hero has its own; hidden on register — standalone form) */}
          {currentTab !== 'landing' && currentTab !== 'register' && (
            <header className="sticky top-0 z-30 bg-[#F9F9F6]/95 backdrop-blur-md border-b border-[#E2E5DC]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <button
                  onClick={() => setCurrentTab('landing')}
                  className="text-left flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#1B3B2B] text-white flex items-center justify-center shadow-sanctuary-sm group-hover:bg-[#142C20] transition-colors">
                    <Church className="w-4.5 h-4.5 text-[#C59B4B]" />
                  </div>
                  <div>
                    <span className="font-heading text-lg font-semibold tracking-tight text-[#18221D] block leading-tight">
                      Student Christian Council
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.08em] text-[#5C6861] font-semibold block">
                      Campus Fresh Student Registry
                    </span>
                  </div>
                </button>

                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentTab('landing')}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl text-[#5C6861] hover:text-[#18221D] hover:bg-[#F3F4EE] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('register')}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-[#5C6861] hover:text-[#18221D] hover:bg-[#F3F4EE]"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('admin')}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl text-[#5C6861] hover:text-[#18221D] hover:bg-[#F3F4EE] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </button>
                </nav>
              </div>
            </header>
          )}

          <main className={`flex-1 ${currentTab === 'landing' ? '' : 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'}`}>
            {currentTab === 'landing' && (
              <LandingHero
                onStartRegistration={() => setCurrentTab('register')}
                onOpenAdmin={() => setCurrentTab('admin')}
                onSelectFellowship={handleSelectFellowship}
                denominations={denominations}
              />
            )}

            {currentTab === 'register' && (
              <StudentRegistrationForm
                onSuccess={handleRegisterSuccess}
                onCancel={() => setCurrentTab('landing')}
                denominationAdmins={admins}
                denominations={denominations}
                initialDenominationId={registrationDenomId ?? undefined}
              />
            )}

            {currentTab === 'admin' && !isAdmin && (
              <AdminLogin
                onLogin={handleLogin}
                onCancel={() => setCurrentTab('landing')}
              />
            )}
          </main>

          {currentTab !== 'landing' && currentTab !== 'register' && (
            <footer className="border-t border-[#E2E5DC] bg-[#FFFFFF] py-5 text-xs text-[#5C6861]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <span className="font-heading font-semibold text-[#18221D]">
                  Student Christian Council (SCC)
                </span>
                <span className="text-[#8C9790]">
                  Campus Fresh Student Registry
                </span>
              </div>
            </footer>
          )}
        </div>
      )}
    </div>
  );
}
